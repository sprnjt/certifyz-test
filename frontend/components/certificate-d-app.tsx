'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Upload, Wallet } from 'lucide-react'
import { Open_Sans } from 'next/font/google'
import { AptosClient, Types } from "aptos"
import { uploadToPinata } from '@/utils/ipfs'; // Import the upload function

const openSans = Open_Sans({ subsets: ['latin'] })

// Aptos network configuration
const NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1"
const MODULE_ADDRESS = "0x78420e487d0b6954f14dff94608e7c1b5383a43e030dd06be08e9add80c1eae6"; // Replace with your actual module address
const MODULE_NAME = "CertificateVerifier";

export function CertificateDApp() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<null | boolean>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedCID, setUploadedCID] = useState<string | null>(null)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [client, setClient] = useState<AptosClient | null>(null)

  useEffect(() => {
    setClient(new AptosClient(NODE_URL))
  }, [])

  const handleWalletConnection = async () => {
    if (isWalletConnected) {
      setIsWalletConnected(false);
      setWalletAddress(null);
    } else {
      try {
        console.log("Attempting to connect to wallet...");
        const { address } = await (window as any).aptos.connect();
        if (address) {
          console.log("Wallet connected:", address);
          setIsWalletConnected(true);
          setWalletAddress(address);
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Please check if the wallet is installed and try again.");
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCertificateIssuance = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Issuing certificate..."); // Log to confirm function is called

    // Log current state values
    console.log("Current State:", {
      uploadedCID,
      recipientAddress,
      client,
      walletAddress,
    });

    if (!uploadedCID || !recipientAddress || !client || !walletAddress) {
      console.error("Missing required data for certificate issuance");
      alert("Please ensure all fields are filled out correctly."); // User feedback
      return;
    }

    if (selectedFile) {
      const cid = await uploadToPinata(selectedFile); // Upload the file to Pinata
      setUploadedCID(cid); // Set the uploaded CID
    } else {
      console.error("No file selected for upload");
      alert("Please select a file to upload."); // User feedback
      return;
    }

    const cidBytes = new TextEncoder().encode(uploadedCID);

    const payload: Types.TransactionPayload = {
      type: "entry_function_payload",
      function: `${MODULE_ADDRESS}::${MODULE_NAME}::issue_certificate`,
      type_arguments: [],
      arguments: [recipientAddress, Array.from(cidBytes)]
    };

    console.log("Issuing certificate with payload:", payload);

    const transaction = await (window as any).aptos.signAndSubmitTransaction(payload);
    await client.waitForTransaction(transaction.hash);

    console.log("Certificate issued with CID:", uploadedCID);
    alert("Certificate issued successfully!"); // User feedback
  };

  const handleCertificateVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client || !walletAddress) {
      console.error("Aptos client not initialized or wallet not connected")
      return
    }

    try {
      const verifyAddress = (document.getElementById('verifyAddress') as HTMLInputElement).value
      const ipfsHash = (document.getElementById('ipfsHash') as HTMLInputElement).value
      const cidBytes = new TextEncoder().encode(ipfsHash)

      const result = await client.view({
        function: `${MODULE_ADDRESS}::${MODULE_NAME}::verify_certificate`,
        type_arguments: [],
        arguments: [walletAddress, verifyAddress, Array.from(cidBytes)]
      })

      setVerificationResult(result[0] as boolean)
    } catch (error) {
      console.error("Error verifying certificate:", error)
      setVerificationResult(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-black text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">CertifyZ</h1>
        </div>
      </nav>
      <div className="container mx-auto p-6 max-w-3xl flex-grow">
        <Card className="w-full">
          <CardHeader className="space-y-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Certificate Verification</CardTitle>
              <Button onClick={handleWalletConnection} variant={isWalletConnected ? "outline" : "default"}>
                <Wallet className="mr-2 h-4 w-4" />
                {isWalletConnected ? "Disconnect Wallet" : "Connect Wallet"}
              </Button>
            </div>
            <CardDescription className="text-lg">Issue and verify certificates on the Aptos blockchain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Issue Certificate</h2>
              <form onSubmit={handleCertificateIssuance} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipientAddress" className="text-sm">Recipient's Aptos Address</Label>
                    <Input 
                      id="recipientAddress" 
                      placeholder="Enter recipient's Aptos address" 
                      className="h-10"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificateFile" className="text-sm">Upload Certificate</Label>
                    <div className="flex items-center space-x-4">
                      <Button asChild variant="outline">
                        <label htmlFor="certificateFile" className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" />
                          Choose File
                        </label>
                      </Button>
                      <input
                        type="file"
                        id="certificateFile"
                        className="hidden"
                        onChange={handleFileChange} // Handle file selection
                      />
                      <span className="text-sm text-gray-500">
                        {selectedFile ? selectedFile.name : "No file chosen"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button className="w-full" type="submit" disabled={!isWalletConnected || !selectedFile}>
                  Issue Certificate
                </Button>
              </form>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Verify Certificate</h2>
              <form onSubmit={handleCertificateVerification} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="verifyAddress" className="text-sm">Recipient's Aptos Address</Label>
                    <Input id="verifyAddress" placeholder="Enter recipient's Aptos address" className="h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ipfsHash" className="text-sm">IPFS Hash</Label>
                    <Input id="ipfsHash" placeholder="Enter IPFS hash of the certificate" className="h-10" />
                  </div>
                </div>
                <Button className="w-full" type="submit" disabled={!isWalletConnected}>
                  Verify Certificate
                </Button>
              </form>
              {verificationResult !== null && (
                <div className={`p-4 rounded-md ${verificationResult ? 'bg-green-100' : 'bg-red-100'}`}>
                  {verificationResult ? (
                    <div className="flex items-center text-green-700">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Certificate is valid
                    </div>
                  ) : (
                    <div className="flex items-center text-red-700">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Certificate is not valid
                    </div>
                  )}
                </div>
              )}
            </section>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            Powered by Aptos blockchain and IPFS
          </CardFooter>
        </Card>
      </div>
      <footer className="mt-6 py-4 bg-black text-white text-center">
        <span className={`${openSans.className} text-sm`}>
          Made by Suparnojit Sarkar
        </span>
      </footer>
    </div>
  )
}