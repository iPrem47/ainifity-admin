import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Loader2, CheckCircle, AlertCircle, Plus, Minus, IndianRupee } from 'lucide-react';
import { InvestorFormData, FormErrors, Reference, PaymentSystem, Account, PanCardType } from './types';
import { validateForm, validateSingleField } from './validation';
import FormSection from './FormSection';
import FormField from './FormField';
import FileUpload from './FileUpload';
import { apiService } from '../../../services/api';
import ReferenceSearchDropdown from './ReferenceSearchDropdown';

interface AddInvestorFormProps {
  onBack: () => void;
  onSubmit: (data: InvestorFormData) => Promise<void>;
}

const AddInvestorForm: React.FC<AddInvestorFormProps> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState<InvestorFormData>({
    nameAsPanCard: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    amount: 500000, // Default amount
    paymentSystem: '',
    referencePerson: '',
    paymentReceivedAccount: '',
    date: new Date().toISOString().split('T')[0],
    bankName: '',
    bankAccountNumber: '',
    ifsc: '',
    nomineeName: '',
    nomineeRelation: '',
    nomineeAadharNumber: '',
    panCardAccountType: 'Individual',
    panCardNumber: '',
    aadharCard: '',
    addressLine1: '',
    addressLine2: '',
    district: '',
    state: '',
    pinCode: '',
    country: 'India',
    description: '',
    activeInvestor: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // API data states
  const [paymentSystems, setPaymentSystems] = useState<PaymentSystem[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [panCardTypes, setPanCardTypes] = useState<PanCardType[]>([]);
  const [loadingPaymentSystems, setLoadingPaymentSystems] = useState(false);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingPanCardTypes, setLoadingPanCardTypes] = useState(false);
  
  // Selected reference state
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);

  // Fetch payment systems
  useEffect(() => {
    const fetchPaymentSystems = async () => {
      try {
        setLoadingPaymentSystems(true);
        const response = await apiService.get('/investor/getAllPaymentSystem');
        if (response.success && response.data) {
          setPaymentSystems(response.data);
        }
      } catch (error) {
        console.error('Error fetching payment systems:', error);
        // Fallback data
        setPaymentSystems([
          { paymentSystemId: 7, name: "Weekly" },
          { paymentSystemId: 31, name: "Monthly" },
          { paymentSystemId: 0, name: "None" }
        ]);
      } finally {
        setLoadingPaymentSystems(false);
      }
    };

    fetchPaymentSystems();
  }, []);

  // Fetch references
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoadingReferences(true);
        const response = await apiService.get('/references');
        if (response && response.results) {
          setReferences(response.results);
        }
      } catch (error) {
        console.error('Error fetching references:', error);
        // Fallback data
        setReferences([
          {
            id: "67f7a173eb52c64544c295b4",
            name: "Smit Patel",
            referenceId: "bae074ff-88f2-497f-8e56-ded52c79031d",
            deleted: false,
            updatedAt: "2025-04-10T10:46:11.916Z",
            totalInvestors: 0
          },
          {
            id: "67f7a182eb52c64544c295b7",
            name: "Akhil Ramani",
            referenceId: "3c258366-ddf1-412f-8e81-6927fb3e2863",
            deleted: false,
            updatedAt: "2025-04-10T10:46:26.137Z",
            totalInvestors: 0
          },
          {
            id: "67f7a189eb52c64544c295ba",
            name: "Dharma",
            referenceId: "24f07be5-d27b-4ea7-9652-d979fd488268",
            deleted: false,
            updatedAt: "2025-06-03T04:57:15.035Z",
            totalInvestors: 1732
          }
        ]);
      } finally {
        setLoadingReferences(false);
      }
    };

    fetchReferences();
  }, []);

  // Fetch accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const response = await apiService.get('/transaction-accounts/getAllAccount?page=1&limit=50');
        if (response.success && response.data) {
          setAccounts(response.data);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        // Fallback data
        setAccounts([
          {
            accountId: "85d4f0cb-49ec-4eef-9c21-3758e8ae6c39",
            name: "Dharma HDFC",
            balance: 0,
            amountColour: "green",
            accountTypeId: 3
          },
          {
            accountId: "93f9fd53-a4ce-4c42-b83d-da7cab0d97ef",
            name: "Dharma IDFC",
            balance: 0,
            amountColour: "green",
            accountTypeId: 3
          },
          {
            accountId: "8b94ea62-ded3-472b-af9e-f348d0b2d8f8",
            name: "AINFINITY",
            balance: -19178400,
            amountColour: "red",
            accountTypeId: 3
          }
        ]);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  // Fetch PAN card types
  useEffect(() => {
    const fetchPanCardTypes = async () => {
      try {
        setLoadingPanCardTypes(true);
        const response = await apiService.get('/investor/getAllPanCardType');
        if (response.success && response.data) {
          // Filter out null values
          const filteredTypes = response.data.filter((type: PanCardType | null) => type !== null);
          setPanCardTypes(filteredTypes);
        }
      } catch (error) {
        console.error('Error fetching PAN card types:', error);
        // Fallback data
        setPanCardTypes([
          { id: 1, label: "Individual" },
          { id: 2, label: "HUF" },
          { id: 3, label: "Minor" }
        ]);
      } finally {
        setLoadingPanCardTypes(false);
      }
    };

    fetchPanCardTypes();
  }, []);

  const relationOptions = [
    { value: 'Father', label: 'Father' },
    { value: 'Mother', label: 'Mother' },
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Son', label: 'Son' },
    { value: 'Daughter', label: 'Daughter' },
    { value: 'Brother', label: 'Brother' },
    { value: 'Sister', label: 'Sister' },
    { value: 'Other', label: 'Other' },
  ];

  const stateOptions = [
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    // Add more states as needed
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value);
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateSingleField(name, value, formData);
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleFileChange = (fieldName: string) => (file: File | undefined) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      setSubmitError('Please fix the errors above before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(formData);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setSubmitSuccess(false);
        onBack();
      }, 2000);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to add investor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Amount increment/decrement handlers
  const incrementAmount = () => {
    setFormData(prev => ({
      ...prev,
      amount: prev.amount + 500000
    }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const decrementAmount = () => {
    if (formData.amount > 500000) {
      setFormData(prev => ({
        ...prev,
        amount: prev.amount - 500000
      }));
      if (errors.amount) {
        setErrors(prev => ({ ...prev, amount: '' }));
      }
    }
  };

  // Search references
  const handleReferenceSearch = (term: string) => {
    // In a real implementation, you would call an API with the search term
    console.log('Searching references with term:', term);
    // For now, we'll just filter the existing references
    // In a real app, this would be an API call
  };

  // Handle reference selection
  const handleReferenceSelect = (reference: Reference) => {
    setSelectedReference(reference);
    setFormData(prev => ({ 
      ...prev, 
      referencePerson: reference.referenceId 
    }));
    if (errors.referencePerson) {
      setErrors(prev => ({ ...prev, referencePerson: '' }));
    }
  };

  // Format amount for display
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Investor</h1>
              <p className="text-gray-600">Create a new investor account with complete details</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle size={24} className="text-green-600" />
              <div>
                <h3 className="text-green-800 font-semibold">Investor Added Successfully!</h3>
                <p className="text-green-600">Redirecting to investors list...</p>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle size={24} className="text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">Submission Error</h3>
                <p className="text-red-600">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Details */}
        <FormSection title="Basic Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Name As Per PanCard"
              name="nameAsPanCard"
              value={formData.nameAsPanCard}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.nameAsPanCard}
              required
              placeholder="Investor Name As Per Pan Card"
            />
            <FormField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.firstName}
              required
              placeholder="Investor First Name"
            />
            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.lastName}
              required
              placeholder="Investor Last Name"
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.email}
              required
              placeholder="Investor Email"
            />
            <FormField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.phoneNumber}
              required
              placeholder="Investor Phone Number"
              prefix="+91"
            />
          </div>
        </FormSection>

        {/* Investment Details */}
        <FormSection title="Investment Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount with increment/decrement buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="text-red-500 mr-1">*</span>
                Amount
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={decrementAmount}
                  className="p-3 bg-gray-100 rounded-l-xl text-gray-600 hover:bg-gray-200 transition-colors border border-gray-300 hover:border-gray-400 active:bg-gray-300"
                >
                  <Minus size={20} />
                </button>
                <div className="flex-1 relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount.toLocaleString()}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      const numValue = value === '' ? 0 : parseInt(value);
                      if (!isNaN(numValue)) {
                        setFormData(prev => ({ ...prev, amount: numValue }));
                      }
                    }}
                    onBlur={handleBlur}
                    className={`w-full pl-10 pr-4 py-3 border-t border-b border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white text-center text-xl font-bold ${
                      errors.amount ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={incrementAmount}
                  className="p-3 bg-gray-100 rounded-r-xl text-gray-600 hover:bg-gray-200 transition-colors border border-gray-300 hover:border-gray-400 active:bg-gray-300"
                >
                  <Plus size={20} />
                </button>
              </div>
              {errors.amount && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.amount}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Current amount: {formatAmount(formData.amount)}
              </p>
            </div>

            {/* Payment System Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="text-red-500 mr-1">*</span>
                Payment System
              </label>
              <div className="relative">
                <select
                  name="paymentSystem"
                  value={formData.paymentSystem}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white appearance-none ${
                    errors.paymentSystem ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Payment System</option>
                  {loadingPaymentSystems ? (
                    <option value="" disabled>Loading payment systems...</option>
                  ) : (
                    paymentSystems.map(system => (
                      <option key={system.paymentSystemId} value={system.name}>
                        {system.name}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown size={18} className="text-gray-400" />
                </div>
              </div>
              {errors.paymentSystem && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.paymentSystem}
                </p>
              )}
            </div>

            {/* Reference Person Dropdown */}
            <div className="md:col-span-2">
              <ReferenceSearchDropdown
                references={references}
                selectedReference={selectedReference}
                onSelect={handleReferenceSelect}
                onSearch={handleReferenceSearch}
                loading={loadingReferences}
                error={errors.referencePerson}
                required
              />
            </div>
          </div>
        </FormSection>

        {/* Payment Details */}
        <FormSection title="Payment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Received Account Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="text-red-500 mr-1">*</span>
                Payment Received Account
              </label>
              <div className="relative">
                <select
                  name="paymentReceivedAccount"
                  value={formData.paymentReceivedAccount}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white appearance-none ${
                    errors.paymentReceivedAccount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Account</option>
                  {loadingAccounts ? (
                    <option value="" disabled>Loading accounts...</option>
                  ) : (
                    accounts.map(account => (
                      <option key={account.accountId} value={account.accountId}>
                        {account.name}
                      </option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown size={18} className="text-gray-400" />
                </div>
              </div>
              {errors.paymentReceivedAccount && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.paymentReceivedAccount}
                </p>
              )}
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="text-red-500 mr-1">*</span>
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white ${
                  errors.date ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.date && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.date}
                </p>
              )}
            </div>
          </div>
        </FormSection>

        {/* Bank Details */}
        <FormSection title="Bank Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.bankName}
              required
              placeholder="Bank Name"
            />
            <FormField
              label="Bank Account Number"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.bankAccountNumber}
              required
              placeholder="Investor Bank Account Number"
            />
            <FormField
              label="IFSC"
              name="ifsc"
              value={formData.ifsc}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.ifsc}
              required
              placeholder="IFSC"
            />
          </div>
        </FormSection>

        {/* Nominee Details */}
        <FormSection title="Nominee Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nominee Name"
              name="nomineeName"
              value={formData.nomineeName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.nomineeName}
              required
              placeholder="Nominee Name"
            />
            <FormField
              label="Nominee Relation"
              name="nomineeRelation"
              value={formData.nomineeRelation}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.nomineeRelation}
              required
              options={relationOptions}
              placeholder="Select Nominee Relation"
            />
            <FormField
              label="Nominee Aadhar Card Number"
              name="nomineeAadharNumber"
              value={formData.nomineeAadharNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.nomineeAadharNumber}
              required
              placeholder="Nominee Aadhar Card Number"
            />
          </div>
        </FormSection>

        {/* Personal Details */}
        <FormSection title="Personal Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PAN Card Account Type Radio Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="text-red-500 mr-1">*</span>
                Pan Card Account Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {loadingPanCardTypes ? (
                  <div className="col-span-3 flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm text-gray-500">Loading options...</span>
                  </div>
                ) : (
                  panCardTypes.map(type => (
                    <label 
                      key={type.id} 
                      className={`flex items-center justify-center px-4 py-3 border rounded-xl cursor-pointer transition-all ${
                        formData.panCardAccountType === type.label 
                          ? 'bg-cyan-50 border-cyan-500 text-cyan-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="panCardAccountType"
                        value={type.label}
                        checked={formData.panCardAccountType === type.label}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{type.label}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <FormField
              label="PAN Card Number"
              name="panCardNumber"
              value={formData.panCardNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.panCardNumber}
              required
              placeholder="Enter PAN Card Number"
            />
            <FormField
              label="Aadhar Card"
              name="aadharCard"
              value={formData.aadharCard}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.aadharCard}
              required
              placeholder="Investor Aadhar Card"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormField
              label="Address Line 1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.addressLine1}
              required
              placeholder="Address Line 1"
            />
            <FormField
              label="Address Line 2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              placeholder="Address Line 2"
            />
            <FormField
              label="District"
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.district}
              required
              placeholder="District"
            />
            <FormField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.state}
              required
              options={stateOptions}
              placeholder="Select State"
            />
            <FormField
              label="PinCode"
              name="pinCode"
              value={formData.pinCode}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.pinCode}
              required
              placeholder="PinCode"
            />
            <FormField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={errors.country}
              required
              placeholder="Country"
            />
          </div>
        </FormSection>

        {/* Documents Upload */}
        <FormSection title="Documents Upload">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUpload
              label="Aadhar Card"
              name="aadharCardFile"
              file={formData.aadharCardFile}
              onChange={handleFileChange('aadharCardFile')}
              required
            />
            <FileUpload
              label="Pan Card"
              name="panCardFile"
              file={formData.panCardFile}
              onChange={handleFileChange('panCardFile')}
              required
            />
            <FileUpload
              label="Cheque/Passbook File"
              name="chequePassbookFile"
              file={formData.chequePassbookFile}
              onChange={handleFileChange('chequePassbookFile')}
              required
            />
            <FileUpload
              label="Bank Statement File"
              name="bankStatementFile"
              file={formData.bankStatementFile}
              onChange={handleFileChange('bankStatementFile')}
              required
            />
            <FileUpload
              label="Signature File"
              name="signatureFile"
              file={formData.signatureFile}
              onChange={handleFileChange('signatureFile')}
              required
            />
          </div>

          <div className="mt-6">
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional notes or description..."
              rows={4}
            />
          </div>
        </FormSection>

        {/* Active Investor Toggle */}
        <FormSection title="">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="activeInvestor"
              checked={formData.activeInvestor}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <label className="text-sm font-medium text-gray-700">
              Active Investor
            </label>
          </div>
        </FormSection>

        {/* Submit Button */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                  isSubmitting || submitSuccess
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Adding Investor...</span>
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Added Successfully!</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Add Investor</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddInvestorForm;