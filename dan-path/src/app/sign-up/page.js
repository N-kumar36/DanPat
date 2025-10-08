"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

// Import necessary Firebase modules using the global constants
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithCustomToken, 
    signInAnonymously,
    createUserWithEmailAndPassword,
    // Email Link Imports
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    // Phone Auth Imports
    RecaptchaVerifier,
    signInWithPhoneNumber,
    onAuthStateChanged,
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    serverTimestamp,
    setLogLevel
} from 'firebase/firestore';

// --- Firebase Initialization and Constants Setup (Mandatory) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' 
    ? __initial_auth_token 
    : null;

// Initialize Firebase App, Auth, and Firestore
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Set Firestore log level for debugging
if (db) setLogLevel('debug');

// Component Start
const SignUp = () => {
    // --- State Management ---
    const [userType, setUserType] = useState("normal"); // 'normal' or 'ngo'
    const [authMethod, setAuthMethod] = useState("emailPassword"); // 'emailPassword', 'emailLink', 'phone'
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        organizationName: "",
        ngoRegistrationId: "",
        ngoAddress: "",
    });
    
    // Auth Flow States
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const recaptchaContainerRef = useRef(null);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);
    const [emailLinkSent, setEmailLinkSent] = useState(false);

    // UI States
    const [passwordError, setPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [isAuthReady, setIsAuthReady] = useState(false);

    // --- Utility Functions ---

    /**
     * Saves user data to Firestore under the authenticated user's ID.
     */
    const saveUserData = useCallback(async (user, type, data) => {
        if (!db || !user) return;
        try {
            const userDocRef = doc(db, `/artifacts/${appId}/users/${user.uid}/profile/data`);

            const profileData = {
                name: data.name,
                email: data.email,
                userType: type,
                authMethod: authMethod,
                createdAt: serverTimestamp(),
                // Add NGO specific fields if applicable
                ...(type === 'ngo' && {
                    organizationName: data.organizationName,
                    ngoRegistrationId: data.ngoRegistrationId,
                    ngoAddress: data.ngoAddress,
                }),
            };

            await setDoc(userDocRef, profileData, { merge: true });
            setStatusMessage({ type: 'success', text: "Account created and profile saved successfully!" });
        } catch (error) {
            console.error("Error saving user data to Firestore:", error);
            setStatusMessage({ type: 'error', text: `Registration complete, but failed to save profile data: ${error.message}` });
        }
    }, [authMethod]);


    // --- Firebase Auth Effects & Initialisation ---

    useEffect(() => {
        if (!auth) {
            setStatusMessage({ type: 'error', text: 'Firebase Auth is not initialized.' });
            setIsAuthReady(true);
            return;
        }

        // 1. Initial Authentication & User ID setup
        const initializeAuth = async () => {
            if (initialAuthToken) {
                try {
                    await signInWithCustomToken(auth, initialAuthToken);
                } catch (error) {
                    console.error("Custom token sign-in failed. Signing in anonymously.", error);
                    await signInAnonymously(auth);
                }
            } else {
                await signInAnonymously(auth);
            }
            setIsAuthReady(true);
        };
        initializeAuth();

        // 2. Email Link Handler (Check if user arrived via an email link)
        // CRITICAL FIX: Ensure code only runs on the client where 'window' is defined.
        if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                // If the email is missing, we must ask the user for it
                // NOTE: Using prompt() is generally avoided in production apps,
                // but kept here for demonstration in this environment.
                email = prompt('Please provide your email for confirmation');
            }
            if (email) {
                setIsLoading(true);
                setAuthMethod('emailLink');
                setFormData(prev => ({ ...prev, email }));
                signInWithEmailLink(auth, email, window.location.href)
                    .then((result) => {
                        window.localStorage.removeItem('emailForSignIn');
                        // After sign-in, the user object is available, now save profile data
                        const user = result.user;
                        if (user) {
                            // In a real app, you'd fetch the rest of the profile data here.
                            // For this demo, we assume the user only provided email.
                            // We redirect the user to a profile creation page to fill out name/type/ngo details.
                            setStatusMessage({ type: 'success', text: "Successfully signed in via Email Link. Please fill out remaining profile details." });
                        }
                    })
                    .catch((error) => {
                        console.error("Email link sign-in failed:", error);
                        setStatusMessage({ type: 'error', text: `Email link sign-in failed: ${error.message}` });
                    })
                    .finally(() => setIsLoading(false));
            }
        }

        // 3. Setup Recaptcha for Phone Auth
        // Ensure recaptcha is only initialized when we switch to phone auth and it hasn't been initialized yet
        if (recaptchaContainerRef.current && authMethod === 'phone' && !recaptchaVerifier) {
            const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
                'size': 'invisible', // Use 'normal' for a visible widget
                'callback': (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                    setStatusMessage({ type: 'info', text: 'reCAPTCHA verified. Ready to send OTP.' });
                },
                'expired-callback': () => {
                    setStatusMessage({ type: 'error', text: 'reCAPTCHA expired. Please try again.' });
                    setRecaptchaVerifier(null);
                }
            });
            verifier.render().then(() => setRecaptchaVerifier(verifier));
        }

    }, [auth, recaptchaVerifier, saveUserData]); // Depend on auth, recaptchaVerifier, and saveUserData

    /**
     * Handles sign-up using the traditional Email and Password method.
     */
    const signUpWithEmailPassword = async () => {
        setIsLoading(true);
        setStatusMessage({ type: '', text: '' });
        
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            
            // On success, save additional profile data to Firestore
            await saveUserData(userCredential.user, userType, formData);
            
        } catch (error) {
            console.error("Email/Password Sign Up Error:", error);
            setStatusMessage({ type: 'error', text: `Sign Up failed: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Sends the passwordless sign-in link to the provided email.
     */
    const handleEmailLinkSend = async () => {
        setIsLoading(true);
        setStatusMessage({ type: '', text: '' });

        if (!formData.email) {
            setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
            setIsLoading(false);
            return;
        }

        // CRITICAL FIX: Define actionCodeSettings and access window only on the client.
        if (typeof window === 'undefined') {
            setStatusMessage({ type: 'error', text: 'Cannot send email link during server rendering.' });
            setIsLoading(false);
            return;
        }

        try {
            // Define actionCodeSettings dynamically using the client-side window object
            const actionCodeSettings = {
                url: window.location.href, 
                handleCodeInApp: true,
            };

            // Send the sign-in link
            await sendSignInLinkToEmail(auth, formData.email, actionCodeSettings);
            // Save email to local storage for verification when user clicks link
            window.localStorage.setItem('emailForSignIn', formData.email);
            setEmailLinkSent(true);
            setStatusMessage({ 
                type: 'success', 
                text: `Success! A sign-in link has been sent to ${formData.email}. Please check your inbox and click the link to complete sign-in.` 
            });
        } catch (error) {
            console.error("Email Link Send Error:", error);
            setStatusMessage({ type: 'error', text: `Failed to send email link: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Sends the OTP code to the provided phone number.
     */
    const handlePhoneOtpSend = async () => {
        setIsLoading(true);
        setStatusMessage({ type: '', text: '' });

        if (!phoneNumber || !recaptchaVerifier) {
            setStatusMessage({ type: 'error', text: 'Please enter a phone number and ensure reCAPTCHA is ready.' });
            setIsLoading(false);
            return;
        }

        try {
            const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
            setConfirmationResult(result);
            setStatusMessage({ type: 'info', text: 'OTP has been sent to your phone.' });
        } catch (error) {
            console.error("Phone Sign In Error:", error);
            setStatusMessage({ type: 'error', text: `Failed to send OTP: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Verifies the OTP code and completes phone authentication.
     */
    const handleOtpVerify = async () => {
        setIsLoading(true);
        setStatusMessage({ type: '', text: '' });

        if (!confirmationResult || !otp) {
            setStatusMessage({ type: 'error', text: 'Please enter the 6-digit verification code.' });
            setIsLoading(false);
            return;
        }

        try {
            const credential = await confirmationResult.confirm(otp);
            const user = credential.user;
            
            // On success, save additional profile data to Firestore
            await saveUserData(user, userType, { 
                ...formData, 
                // Set defaults if user relied only on phone auth
                name: formData.name || "Phone User", 
                email: formData.email || "N/A" 
            });
            
        } catch (error) {
            console.error("OTP Verification Error:", error);
            setStatusMessage({ type: 'error', text: `OTP verification failed: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    // --- Form Handlers ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleUserTypeChange = (type) => {
        setUserType(type);
        if (type === "normal") {
            setFormData((prevData) => ({
                ...prevData,
                organizationName: "",
                ngoRegistrationId: "",
                ngoAddress: "",
            }));
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setPasswordError("");
        setStatusMessage({ type: '', text: '' });

        // Basic form validity check (browser handles most of the required fields, but this catches pre-submit logic)
        if (authMethod === "emailPassword") {
            if (formData.password !== formData.confirmPassword) {
                setPasswordError("Passwords do not match.");
                return;
            }
            signUpWithEmailPassword();
        } else if (authMethod === "emailLink") {
            handleEmailLinkSend();
        } 
        // Phone auth is handled by separate button actions (handlePhoneOtpSend/handleOtpVerify)
    };

    // --- Render Logic for Auth Form ---

    const renderAuthForm = () => {
        switch (authMethod) {
            case 'emailPassword':
                return (
                    <>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                    placeholder="Email"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                    placeholder="Password"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                    placeholder="Confirm Password"
                                />
                                {passwordError && (
                                    <p className="mt-2 text-sm text-red-400">{passwordError}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                        >
                            {isLoading ? 'Signing Up...' : 'Sign Up with Email & Password'}
                        </button>
                    </>
                );

            case 'emailLink':
                return (
                    <>
                        {emailLinkSent ? (
                            <p className="text-center text-sm text-yellow-300 p-3 bg-white/10 rounded-lg">
                                Email sent! Check your inbox (and spam folder) for the sign-in link.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                        Email address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                        placeholder="Email for Magic Link"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                                >
                                    {isLoading ? 'Sending Link...' : 'Send Sign-in Link (Passwordless)'}
                                </button>
                            </div>
                        )}
                    </>
                );

            case 'phone':
                return (
                    <>
                        <div className="space-y-4">
                            <p className="text-center text-sm text-yellow-300 p-2 bg-white/10 rounded-lg">
                                Note: Name and Email fields above are used for initial profile creation.
                            </p>
                            
                            {!confirmationResult ? (
                                <>
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
                                            Phone Number (e.g., +15551234567)
                                        </label>
                                        <input
                                            id="phoneNumber"
                                            name="phoneNumber"
                                            type="tel"
                                            required
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                            placeholder="+1234567890"
                                        />
                                    </div>
                                    <div ref={recaptchaContainerRef} id="recaptcha-container" className="hidden"></div>
                                    <button
                                        type="button"
                                        onClick={handlePhoneOtpSend}
                                        disabled={isLoading || !recaptchaVerifier}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                                    >
                                        {isLoading ? 'Sending OTP...' : 'Send Verification Code (OTP)'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label htmlFor="otp" className="block text-sm font-medium text-gray-300">
                                            Verification Code (OTP)
                                        </label>
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            required
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                            placeholder="6-digit code"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleOtpVerify}
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify & Sign Up'}
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    if (!isAuthReady) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white">
                <p>Initializing Firebase...</p>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen w-full p-4 
                        bg-neutral-950 
                        bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            <div className="w-full max-w-lg p-8 space-y-6 
                        bg-white/5 backdrop-blur-md rounded-xl shadow-2xl 
                        border border-white/10 text-white z-10">
                
                <h2 className="text-3xl font-extrabold text-center text-white">
                    Create Your Account
                </h2>
                <p className="text-center text-gray-300">
                    Choose your account type and sign-up method.
                </p>

                {/* Status Message Display */}
                {statusMessage.text && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${
                        statusMessage.type === 'error' ? 'bg-red-900/50 text-red-300' :
                        statusMessage.type === 'success' ? 'bg-green-900/50 text-green-300' :
                        'bg-blue-900/50 text-blue-300'
                    }`}>
                        {statusMessage.text}
                    </div>
                )}

                {/* User Type Selection */}
                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        type="button"
                        onClick={() => handleUserTypeChange("normal")}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition duration-200
                            ${userType === "normal"
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "bg-white/10 text-gray-300 hover:bg-white/20"
                            }`}
                    >
                        Normal User
                    </button>
                    <button
                        type="button"
                        onClick={() => handleUserTypeChange("ngo")}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition duration-200
                            ${userType === "ngo"
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "bg-white/10 text-gray-300 hover:bg-white/20"
                            }`}
                    >
                        NGO / Organization
                    </button>
                </div>

                {/* Authentication Method Selection */}
                <div className="border-t border-white/10 pt-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Choose Sign-Up Method:</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {['emailPassword', 'emailLink', 'phone'].map((method) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => {
                                    setAuthMethod(method);
                                    // Reset phone/email link specific states on method change
                                    setConfirmationResult(null);
                                    setEmailLinkSent(false);
                                    setStatusMessage({ type: '', text: '' });
                                }}
                                className={`py-2 px-3 rounded-lg text-xs font-medium transition duration-200 text-center
                                    ${authMethod === method
                                        ? "bg-purple-600 text-white shadow-lg"
                                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                                    }`}
                            >
                                {method === 'emailPassword' ? 'Email/Pass' : method === 'emailLink' ? 'Magic Link' : 'Phone/OTP'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Form */}
                <form className="space-y-6" onSubmit={handleFormSubmit}>
                    {/* Common Fields */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                            Full Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                            placeholder="Name"
                        />
                    </div>
                    
                    {/* Email for profile, shown regardless of auth method, but required for Email/Pass/Link */}
                    {authMethod !== 'phone' && (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                placeholder="Email"
                            />
                        </div>
                    )}

                    {/* Dynamic Auth Fields */}
                    {renderAuthForm()}

                    {/* NGO Specific Fields */}
                    {userType === "ngo" && (
                        <>
                            <div className="border-t border-white/10 pt-6">
                                <h3 className="text-xl font-bold text-white mb-4">NGO Details</h3>
                                
                                <div>
                                    <label htmlFor="organizationName" className="block text-sm font-medium text-gray-300">
                                        Organization Name
                                    </label>
                                    <input
                                        id="organizationName"
                                        name="organizationName"
                                        type="text"
                                        required={userType === "ngo"}
                                        value={formData.organizationName}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                        placeholder="Your Organization's Name"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label htmlFor="ngoRegistrationId" className="block text-sm font-medium text-gray-300">
                                        NGO Registration ID
                                    </label>
                                    <input
                                        id="ngoRegistrationId"
                                        name="ngoRegistrationId"
                                        type="text"
                                        required={userType === "ngo"}
                                        value={formData.ngoRegistrationId}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                        placeholder="e.g., Reg12345"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label htmlFor="ngoAddress" className="block text-sm font-medium text-gray-300">
                                        NGO Address
                                    </label>
                                    <textarea
                                        id="ngoAddress"
                                        name="ngoAddress"
                                        rows="3"
                                        required={userType === "ngo"}
                                        value={formData.ngoAddress}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-white outline-none transition"
                                        placeholder="Enter your NGO's full address"
                                    ></textarea>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                {/* Login Prompt */}
                <div className="text-center text-sm text-gray-400 pt-4 border-t border-white/10">
                    Already have an account?{" "}
                    {/* Note: Link is rendered as a placeholder for /log-in since Next.js routing is not available */}
                    <a href="/log-in" className="font-medium text-indigo-400 hover:text-indigo-300 transition">
                        Log in
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
