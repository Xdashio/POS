import React, { useState } from 'react';
import { X, Check, AlertCircle, Smartphone, CreditCard, Banknote, Loader2, Receipt, ArrowLeft } from 'lucide-react';

function PaymentProcessing({ 
  method, 
  amount, 
  onClose, 
  onComplete, 
  onBack 
}) {
  const [processingStep, setProcessingStep] = useState('initiating');
  const [error, setError] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  const generateTransactionId = () => {
    return 'TXN' + Date.now().toString().slice(-8);
  };

  const processPayment = async () => {
    try {
      setError(null);
      
      // Simulate payment processing based on method
      if (method === 'cash') {
        await processCashPayment();
      } else if (method === 'mpesa') {
        await processMpesaPayment();
      } else if (method === 'card') {
        await processCardPayment();
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      setProcessingStep('error');
    }
  };

  const processCashPayment = async () => {
    // Step 1: Initiating
    setProcessingStep('initiating');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Awaiting cash confirmation
    setProcessingStep('awaiting_cash');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Processing
    setProcessingStep('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Success
    const txnId = generateTransactionId();
    setTransactionId(txnId);
    setProcessingStep('success');
  };

  const processMpesaPayment = async () => {
    // Step 1: Initiating
    setProcessingStep('initiating');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Sending STK Push
    setProcessingStep('stk_push');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Awaiting confirmation
    setProcessingStep('awaiting_confirmation');
    await new Promise(resolve => setTimeout(resolve, 4000));

    // Step 4: Processing
    setProcessingStep('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 5: Success
    const txnId = generateTransactionId();
    setTransactionId(txnId);
    setProcessingStep('success');
  };

  const processCardPayment = async () => {
    // Step 1: Initiating
    setProcessingStep('initiating');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Step 2: Connecting to payment processor
    setProcessingStep('connecting');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Processing payment
    setProcessingStep('processing');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 4: Success
    const txnId = generateTransactionId();
    setTransactionId(txnId);
    setProcessingStep('success');
  };

  const handleComplete = () => {
    onComplete({
      method,
      amount,
      transactionId,
      timestamp: new Date().toISOString()
    });
  };

  const handleRetry = () => {
    setError(null);
    setProcessingStep('initiating');
    processPayment();
  };

  // Start processing when component mounts
  React.useEffect(() => {
    processPayment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderProcessingStep = () => {
    switch (processingStep) {
      case 'initiating':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="text-blue-600 animate-spin" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Initiating Payment</h3>
            <p className="text-gray-600">Setting up payment transaction...</p>
          </div>
        );

      case 'stk_push':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Smartphone className="text-green-600 animate-bounce" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sending M-Pesa Prompt</h3>
            <p className="text-gray-600 mb-4">Check your phone for M-Pesa STK Push</p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Enter M-Pesa PIN to complete</p>
              <p className="text-lg font-bold text-green-600">KES {amount.toFixed(2)}</p>
            </div>
          </div>
        );

      case 'awaiting_confirmation':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Smartphone className="text-orange-600 animate-pulse" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Awaiting Confirmation</h3>
            <p className="text-gray-600">Waiting for M-Pesa confirmation...</p>
            <div className="flex justify-center mt-4 space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        );

      case 'awaiting_cash':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote className="text-yellow-600 animate-pulse" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Awaiting Cash Payment</h3>
            <p className="text-gray-600 mb-4">Please collect cash from customer</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Amount Due:</p>
              <p className="text-2xl font-bold text-yellow-700">KES {amount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">Confirm cash received to continue</p>
            </div>
            <button 
              onClick={() => setProcessingStep('processing')}
              className="mt-4 w-full btn btn-primary btn-md"
            >
              Cash Received - Continue
            </button>
          </div>
        );

      case 'connecting':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CreditCard className="text-purple-600 animate-pulse" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connecting to Bank</h3>
            <p className="text-gray-600">Establishing secure connection...</p>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="text-primary-600 animate-spin" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Verifying transaction details...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">Transaction completed successfully</p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm font-semibold">{transactionId}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-semibold text-green-700">KES {amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Method:</span>
                <span className="font-semibold capitalize">{method}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => window.print()}
                className="flex-1 btn btn-outline btn-md flex items-center justify-center"
              >
                <Receipt className="mr-2" size={16} />
                Print Receipt
              </button>
              <button 
                onClick={handleComplete}
                className="flex-1 btn btn-primary btn-md"
              >
                Complete Sale
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            
            <div className="flex space-x-3">
              <button 
                onClick={onBack}
                className="flex-1 btn btn-outline btn-md"
              >
                <ArrowLeft className="mr-2" size={16} />
                Back
              </button>
              <button 
                onClick={handleRetry}
                className="flex-1 btn btn-primary btn-md"
              >
                Retry Payment
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getMethodIcon = () => {
    switch (method) {
      case 'cash': return <Banknote className="text-yellow-600" size={24} />;
      case 'mpesa': return <Smartphone className="text-green-600" size={24} />;
      case 'card': return <CreditCard className="text-blue-600" size={24} />;
      default: return null;
    }
  };

  const getMethodColor = () => {
    switch (method) {
      case 'cash': return 'border-yellow-200 bg-yellow-50';
      case 'mpesa': return 'border-green-200 bg-green-50';
      case 'card': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${getMethodColor()}`}>
          <div className="flex items-center space-x-3">
            {getMethodIcon()}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 capitalize">{method} Payment</h3>
              <p className="text-sm text-gray-600">KES {amount.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {renderProcessingStep()}
        </div>
      </div>
    </div>
  );
}

export default PaymentProcessing;
