import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const POST_ACCOUNT_URL = "http://localhost:4000/users/account"; 
const UPDATE_PROXY_ID_URL = "http://localhost:4000/users/update-proxy";
const UPDATE_DATA_CENTRE_ID_URL ="http://localhost:4000/users/update-datacentre";

const PostAccount = () => {
  const [balance, setBalance] = useState('');
  const [eliteResidentialHash, setEliteResidentialHash] = useState('');
  const [residentialProxiesIDsInput, setResidentialProxiesIDsInput] = useState('');
  const [datacenterProxiesIDsInput, setDatacenterProxiesIDsInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [newProxyId, setNewProxyId] = useState("");
  const [newDataCentreId, setNewDatacentreId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("userData");

    if (accessToken) setToken(JSON.parse(accessToken));
    if (userData) setUserId(JSON.parse(userData).id);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert comma-separated input strings to arrays
    const residentialProxiesIDsArray = residentialProxiesIDsInput.split(',').map(id => id.trim()).filter(id => id);
    const datacenterProxiesIDsArray = datacenterProxiesIDsInput.split(',').map(id => id.trim()).filter(id => id);

    // Prepare data for encryption
    const dataToEncrypt = {
      userId: parseInt(userId),
      balance: parseFloat(balance),
      eliteResidentialHash,
      residentialProxiesIDsArray,
      datacenterProxiesIDsArray
    };
    Object.entries(dataToEncrypt).forEach(([key, value]) => console.log(`${key} : ${JSON.stringify(value)}`));

    // Encrypt the data
    const dataStr = JSON.stringify(dataToEncrypt);
    const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
    const encryptionKey = process.env.REACT_APP_SECRET_KEY; 

    const encryptedData = CryptoJS.AES.encrypt(dataStr, CryptoJS.enc.Utf8.parse(encryptionKey), {
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
      const response = await fetch(POST_ACCOUNT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message);
        setTimeout(() => setError(''), 5000);
        return;
      }

      setSuccess("Data created successfully");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to post data.");
    }finally{
        setLoading(false);
    }
  };
  const encryption = (data) =>{
    console.log("Data: ", data);
    const dataStr = JSON.stringify(data);
    const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
    const encryptionKey = process.env.REACT_APP_SECRET_KEY; 

    const encryptedData = CryptoJS.AES.encrypt(dataStr, CryptoJS.enc.Utf8.parse(encryptionKey), {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    }).toString();

    const payload = {
        iv: iv,
        ciphertext: encryptedData
      };

      return payload;

  }

  const updateDataCentre = async () =>{
    setLoading(true);

    const newData = {
        newDataCentreId: newDataCentreId
    }

    const data = encryption(newData);
    Object.entries(data).forEach(([key, value]) => console.log(`${key} : ${JSON.stringify(value)}`));

    try {
        const response = await fetch(`${UPDATE_DATA_CENTRE_ID_URL}/${userId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success){
            setSuccess(result.message);
            setTimeout(() => setSuccess(""), 5000);
        }else{
            setError(result.message);
            setTimeout(() => setError(''), 5000);
            return;
        }
    } catch (error) {
        setError(`There was an error. Error: ${error}`);
        setTimeout(() => setError(''), 5000);
        return;
    }finally{
        setLoading(false);
    }

  };

  const updateProxy = async () =>{
    setLoading(true);
    let data;
    if (newProxyId) data = encryption(newProxyId);
    data = encryption(newProxyId);
    Object.entries(data).forEach(([key, value]) => console.log(`${key} : ${JSON.stringify(value)}`));

    try {
        const response = await fetch(`${UPDATE_PROXY_ID_URL}/${userId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        const result = await response.json()

        if (result.success){
            setSuccess(result.message);
            setTimeout(() => setSuccess(""), 5000);
        }else{
            setError(result.message);
            setTimeout(() => setError(''), 5000);
            return;
        }
    } catch (error) {
        setError(`There was an error. Error: ${error}`);
        setTimeout(() => setError(''), 5000);
        return;
        
    }finally{
        setLoading(false);
    }

  }

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Post Account Data</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Balance</label>
          <input
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Elite Residential Hash</label>
          <input
            type="text"
            value={eliteResidentialHash}
            onChange={(e) => setEliteResidentialHash(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Residential Proxies IDs (comma-separated)</label>
          <input
            type="text"
            value={residentialProxiesIDsInput}
            onChange={(e) => setResidentialProxiesIDsInput(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter IDs separated by commas"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Datacenter Proxies IDs (comma-separated)</label>
          <input
            type="text"
            value={datacenterProxiesIDsInput}
            onChange={(e) => setDatacenterProxiesIDsInput(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter IDs separated by commas"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
        >
          Submit
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-500 mt-2">{success}</div>}
      </form>
      <div className="mb-4">
          <label className="block text-gray-700">New Proxy ID</label>
          <input
            type="text"
            value={newProxyId}
            onChange={(e) => setNewProxyId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter new ID"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
          onClick={updateProxy}
        >
          Update
        </button>
        <div className="mb-4">
          <label className="block text-gray-700">New Data Centre ID</label>
          <input
            type="text"
            value={newDataCentreId}
            onChange={(e) => setNewDatacentreId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter new ID"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
          onClick={updateDataCentre}
        >
          Update
        </button>
        {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-red-700"></div>
            </div>
        )}
    </div>
  );
};

export default PostAccount;
