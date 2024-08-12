import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import { jwtDecode } from 'jwt-decode';
import landingImage from './landing.jpeg';

// npm install jwt-decode
// npm install crypto-js
// npm install react-icons

const SIGNUP_URL = "http://localhost:4001/users/signup";
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

console.log("Secret Key :", SECRET_KEY);

const Signup = ({ setLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referred, setReferred] = useState(false);
  const [refereeEmail, setRefereeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupMessage, setSignupMessage] = useState('');
  const navigate = useNavigate();

  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [isLengthValid, setIsLengthValid] = useState(false);

  const updatePassword = (value) => {
    setPassword(value);
    setHasUpperCase(/[A-Z]/.test(value));
    setHasLowerCase(/[a-z]/.test(value));
    setHasNumber(/\d/.test(value));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(value));
    setIsLengthValid(value.length >= 6);
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    setLoading(true);

    const dataToEncrypt = {
      username: username,
      password: password,
      referredBy: referred ? refereeEmail: null
    };
    Object.entries(dataToEncrypt).forEach(([key, value]) => console.log(`${key} : ${JSON.stringify(value)}`));
    console.log("SECRET KEY :", SECRET_KEY)
    const dataStr = JSON.stringify(dataToEncrypt);
    const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
    const encryptedData = CryptoJS.AES.encrypt(dataStr, CryptoJS.enc.Utf8.parse(SECRET_KEY), {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    }).toString();

    const payload = {
      iv: iv,
      ciphertext: encryptedData
    };
    Object.entries(payload).forEach(([key, value]) => console.log(`${key} : ${JSON.stringify(value)}`));

    try {
      const response = await fetch(SIGNUP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        const decodedToken = jwtDecode(result.accessToken);
        const userDetails = {
          id: decodedToken.id,
          username: decodedToken.username
        };
        Object.entries(userDetails).forEach(([key, value]) => console.log(`User Details ${key} : ${JSON.stringify(value)}`))
        localStorage.setItem("userData", JSON.stringify(userDetails));
        localStorage.setItem("accessToken", result.accessToken);
        setLoggedIn(true);

        setSignupMessage(result.message);
        setTimeout(() => {
          setSignupMessage('');
          navigate('/login');
        }, 5000); 
        setUsername('');
        setPassword('');
        setReferred(false);
        setRefereeEmail('');
        setIsLengthValid(false);
      } else {
        setError(result.message);
        setUsername('');
        setPassword('');
        setReferred(false);
        setRefereeEmail('');
        setHasLowerCase(false);
        setHasNumber(false);
        setHasSpecialChar(false);
        setHasUpperCase(false);
        setIsLengthValid(false);
      }
    } catch (error) {
      setError(`Error: ${error}`);
      setUsername('');
      setPassword('');
      setReferred(false);
      setRefereeEmail('');
      setHasLowerCase(false);
      setHasNumber(false);
      setHasSpecialChar(false);
      setHasUpperCase(false);
      setIsLengthValid(false);
    } finally {
      setLoading(false);
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center fixed top-0 left-0 right-0 bottom-0"
      style={{ backgroundImage: `url(${landingImage})` }}
    >
      <div className="bg-black bg-opacity-70 p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">Sign Up</h2>
        <form onSubmit={handleSignup}>
          <div className="mb-4">
            <label className="block text-gray-300">Email</label>
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full p-2 border rounded mt-1 bg-gray-100 text-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => updatePassword(e.target.value)}
                className="w-full p-2 border rounded mt-1 bg-gray-100 text-black"
                required
              />
              <span className="absolute right-2 top-3 cursor-pointer text-gray-800" onClick={handlePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="flex mt-1">
              <div className={`flex-1 ${hasUpperCase ? 'text-green-500' : 'text-gray-400'}`}>
                <FaCheckCircle className="inline mr-1" />
                Uppercase
              </div>
              <div className={`flex-1 ${hasLowerCase ? 'text-green-500' : 'text-gray-400'}`}>
                <FaCheckCircle className="inline mr-1" />
                Lowercase
              </div>
              <div className={`flex-1 ${hasNumber ? 'text-green-500' : 'text-gray-400'}`}>
                <FaCheckCircle className="inline mr-1" />
                Number
              </div>
              <div className={`flex-1 ${hasSpecialChar ? 'text-green-500' : 'text-gray-400'}`}>
                <FaCheckCircle className="inline mr-1" />
                Special Char
              </div>
              <div className={`flex-1 ${isLengthValid ? 'text-green-500' : 'text-gray-400'}`}>
                <FaCheckCircle className="inline mr-1" />
                Length (6+)
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-300">Were you referred?</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={referred}
                onChange={() => setReferred(!referred)}
                className="mr-2"
              />
              <span className="text-gray-300">Yes</span>
            </div>
          </div>
          {referred && (
            <div className="mb-4">
              <label className="block text-gray-300">Referee Email</label>
              <input
                type="email"
                value={refereeEmail}
                onChange={(e) => setRefereeEmail(e.target.value.toLowerCase())}
                className="w-full p-2 border rounded mt-1 bg-gray-100 text-black"
              />
            </div>
          )}
          <button type="submit" className="bg-gray-900 hover:bg-gray-700 text-white w-full py-2 rounded mt-4">
            Sign Up
          </button>
          <div className="text-center mt-4">
            <NavLink to="/login" className="bg-gray-900 text-white p-2 rounded hover:bg-gray-700">
              Already have an account? Login
            </NavLink>
          </div>
        </form>
        {error && (
          <div className="text-red-500 mt-2 text-sm text-center">{error}</div>
        )}
        {signupMessage && (
          <div className="text-green-500 mt-2 text-sm text-center">{signupMessage}</div>
        )}
        {loading && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-red-700"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
