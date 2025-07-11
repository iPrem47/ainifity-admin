import React, { useState, useRef } from 'react';
import { X, Upload, Minus, Plus, IndianRupee } from 'lucide-react';
import { InvestorProfile } from '../types';
import { apiService } from '../../../../services/api';
import { useAccounts } from '../../../PendingTransactions/hooks/useAccounts';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: InvestorProfile | null;
  onSuccess: () => void;
}
interface AddFundsFormData {
  amount: number;
  dateTime: string; // e.g., "2025-07-05"
  transactionRefNumber: string;
  transactionalBankId: string;
  transactionImage: File | null;
  type: string;
}


const AddFundsModal: React.FC<AddFundsModalProps> = ({ isOpen, onClose, investor, onSuccess }) => {
const [formData, setFormData] = useState<AddFundsFormData>({
    amount: 50000,
    dateTime: new Date().toISOString().split('T')[0],
    transactionRefNumber: '',
    transactionalBankId:'',
    transactionImage: null,
    type: '',
  });
  const { accounts, loading: loadingAccounts } = useAccounts();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('All');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => {
  // Set today's date by default
    return new Date().toISOString().split('T')[0];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !investor) return null;


  const handleAccountChange = (accountId: string, accountName: string) => {
    setSelectedAccount(accountName);
    alert(accountId)
    setFormData(prev => ({ ...prev, transactionalBankId : accountId }));
    setIsAccountOpen(false);
  };
  
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.transactionRefNumber.trim()) {
      newErrors.transactionRefNumber = 'Transaction reference number is required';
    }

    if (!formData.transactionImage) {
      newErrors.transactionImage = 'Please upload a transaction screenshot';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('amount', formData.amount.toString());
      submitData.append('transactionalBankId', formData.transactionalBankId.toString());
      submitData.append('investorId', investor.id);
      submitData.append('transactionRefNumber', formData.transactionRefNumber);
      
      if (formData.transactionImage) {
        submitData.append('transactionImage', formData.transactionImage);
      }

      console.log('Submitting add funds with payload:', {
        amount: formData.amount,
        transactionalBankId: investor.transactionalBankId,
        investorId: investor.id,
        transactionRefNumber: formData.transactionRefNumber,
        transactionImage: formData.transactionImage ? formData.transactionImage.name : null
      });

      // Call API with multipart/form-data
      const response = await fetch(`${apiService.getBaseUrl()}/transaction/admin/addFunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: submitData
      });
      
      const responseData = await response.json();
      
      if (responseData.success) {
        showNotification('Funds added successfully!', 'success');
        onSuccess();
        onClose();
      } else {
        throw new Error(responseData.message || 'Failed to add funds');
      }
    } catch (error: any) {
      console.error('Error adding funds:', error);
      showNotification(error.message || 'Failed to add funds', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, transactionImage: file }));
      setErrors(prev => ({ ...prev, transactionImage: '' }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, transactionImage: null }));
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAmountChange = (amount: number) => {
    setFormData(prev => ({ ...prev, amount }));
    setErrors(prev => ({ ...prev, amount: '' }));
  };

  const incrementAmount = () => {
    setFormData(prev => ({ ...prev, amount: prev.amount + 50000 }));
    setErrors(prev => ({ ...prev, amount: '' }));
  };

  const decrementAmount = () => {
    if (formData.amount > 50000) {
      setFormData(prev => ({ ...prev, amount: prev.amount - 50000 }));
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 4000);
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Funds</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Investment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500 mr-1">*</span>
              Investment Amount
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={decrementAmount}
                className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Minus size={20} />
              </button>
              <div className="flex-1 mx-4">
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white text-center text-xl font-bold ${
                      errors.amount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>
              <button
                type="button"
                onClick={incrementAmount}
                className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>


          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white text-gray-900"
              />
            </div>  
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="text-red-500">*</span> Type
            </label>
            <div className="flex gap-4">
              {['New', 'Old'].map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-colors `}
                >
                  <input
                    type="radio"
                    name="type"
                    value={option}
                    checked={formData.type === option}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    // className="accent-cyan-500"
                  />
                  <span className="text-sm font-medium">{option}</span>
                </label>
              ))}
            </div>
            {errors.type && <p className="mt-2 text-sm text-red-600">{errors.type}</p>}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
            
            {/* Name As Per Bank */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>
                Name As Per Bank
              </label>
              <input
                type="text"
                value={investor.nameAsPerPanCard}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
              />
            </div>
            
            {/* Bank Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>
                Bank Name
              </label>
              <input
                type="text"
                value={investor.bankName}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700"
              />
            </div>
            
            {/* Account Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>
                Account Number
              </label>
              <input
                type="text"
                value={investor.bankAccountNumber}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-mono"
              />
            </div>
            
            {/* IFSC Code */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>
                IFSC Code
              </label>
              <input
                type="text"
                value={investor.ifscCode}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 font-mono"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details 123</h3>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span>
                Select Transactional Bank
              </label>
              <button
                type="button"
                onClick={() => setIsAccountOpen((prev) => !prev)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-left flex justify-between items-center hover:border-cyan-400 transition-colors"
              >
                <span>{selectedAccount}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    isAccountOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAccountOpen && !loadingAccounts && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => handleAccountChange('All', 'All')}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-xl ${
                      selectedAccount === 'All' ? 'bg-cyan-50 text-cyan-700' : ''
                    }`}
                  >
                    All Accounts
                  </button>
                  {accounts.map((account) => (
                    <button
                      key={account.accountId}
                      onClick={() => handleAccountChange(account.accountId, account.name)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        selectedAccount === account.name ? 'bg-cyan-50 text-cyan-700' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{account.name}</span>
                        <span
                          className={`text-xs ${
                            account.amountColour === 'green' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatAmount(account.balance)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Transaction Reference Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>
                Transaction Reference Number
              </label>
              <input
                type="text"
                value={formData.transactionRefNumber}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, transactionRefNumber: e.target.value }));
                  setErrors(prev => ({ ...prev, transactionRefNumber: '' }));
                }}
                placeholder="Enter transaction reference number"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white ${
                  errors.transactionRefNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.transactionRefNumber && (
                <p className="mt-2 text-sm text-red-600">{errors.transactionRefNumber}</p>
              )}
            </div>
            
            {/* Upload Screenshot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500 mr-1">*</span>
                Upload Screenshot
              </label>
              <div 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  errors.transactionImage 
                    ? 'border-red-300 bg-red-50' 
                    : previewUrl 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {previewUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Transaction screenshot" 
                      className="max-h-48 mx-auto rounded-lg shadow-sm" 
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={32} className="mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Select File (Max: 5MB)</p>
                      <p className="text-xs text-gray-500">JPG, PNG, JPEG up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>
              {errors.transactionImage && (
                <p className="mt-2 text-sm text-red-600">{errors.transactionImage}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-lg ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
              }`}
            >
              {isSubmitting ? 'Processing...' : 'Proceed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFundsModal;