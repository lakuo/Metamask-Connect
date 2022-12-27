import disconnectedimg from './disconnected.png';
import connectedimg from './connected.png';
import disconnectimg from './disconnect.png';
import connectingimg from './connecting.png'
import './App.css';
import React, { useState, useEffect } from 'react';
import createMetaMaskProvider from 'metamask-extension-provider';
import detectEthereumProvider from '@metamask/detect-provider';

function App() {
  const [connected, setConnected] = useState(false);
  const [imageToShow, setImageToShow] = useState(connected ? connectedimg : disconnectedimg);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const styles = { cursor: 'pointer' };

  useEffect(() => {
    async function initiate() {
      const response = await fetchAndSetProvider();
      setProvider(response)
      await handleAccount(response)
    }
    initiate();
  }, []);

  const fetchAndSetProvider = async () => {
    //const response = await detectEthereumProvider();
    const response = createMetaMaskProvider();
    return response
  };

  const handleAccount = async (provider) => {
    console.log(provider)
    setConnected(provider.isConnected())
    provider
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged);
    provider.on('accountsChanged', handleAccountsChanged);
  };

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      setConnected(false)
    } else if (accounts[0] !== currentAccount) {
      setCurrentAccount(accounts[0]);
      setConnected(true)
    }
  }

  const connect = async () => {
    setIsLoading(true);
    provider
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          alert('Connection failed! Please try again.');
        } else {
          console.error(err);
        }
      });
    setIsLoading(false);
  };

  function disconnect() {
    console.log('disconnect')
    setCurrentAccount(null)
    // provider.removeAllListeners()
    // provider.removeListener('accountsChanged', handleAccountsChanged);

    // provider.request({
    //   method: 'eth_requestPermissions',
    //   params: [{ logout: true }]
    // });
    // provider.logout()
    setConnected(false)
  }

  const handleMouseEnter = () => {
    setImageToShow(connected ? disconnectimg : connectedimg);
  };
  const handleMouseLeave = () => {
    setImageToShow(connected ? connectedimg : disconnectedimg);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>{provider != null ? '' : 'Please install Metamask first!'}</h1>
        <h2>{connected ? "Connected" : (isLoading ? "Loading..." : "Connect to Metamask!")}</h2>
        <div style={styles} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          <img src={isLoading ? connectingimg : imageToShow} onClick={connected ? disconnect : connect} />
        </div>
        <div>
          <h6>{connected ? "Your Account:" : ""}</h6>
          <h6>{connected ? currentAccount : ""}</h6>
        </div>
      </header >
    </div >
  );
}

export default App;
