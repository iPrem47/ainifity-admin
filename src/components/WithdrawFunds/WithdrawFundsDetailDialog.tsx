import React, { useState } from 'react';
import { X, User, Calendar, CreditCard, FileText, Image, Tag, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, ArrowDownLeft } from 'lucide-react';
import { WithdrawFundsRequest } from './types';
import { formatAmountIndian, showNotification } from '../../utils/utils';
import apiService from '../../services/api';

interface WithdrawFundsDetailDialogProps {
  request: WithdrawFundsRequest | null;
  isOpen: boolean;
  onClose: () => void;
  refetchData: () => void;
}

const WithdrawFundsDetailDialog: React.FC<WithdrawFundsDetailDialogProps> = ({ request, isOpen, onClose, refetchData }) => {
  if (!isOpen || !request) return null;
  const [loading, setLoading] = useState(false);

  const formatAmount = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (statusId: number) => {
    switch (statusId) {
      case 0:
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
      case 1:
        return { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
      case 2:
        return { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: AlertCircle };
    }
  };

  const getWithdrawStatusInfo = (status: string) => {
    switch (status) {
      case 'Not':
        return { label: 'Not Withdrawn', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'Partial':
        return { label: 'Partially Withdrawn', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'Full':
        return { label: 'Fully Withdrawn', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const statusInfo = getStatusInfo(request.transactionStatusId);
  const withdrawStatusInfo = getWithdrawStatusInfo(request.withdrawStatus);
  const StatusIcon = statusInfo.icon;


  const handleClose = () => {
    onClose(); // Close the dialog
    refetchData(); // Always refetch when closing

  };

  const handleTransaction = async (status: number) => {
    if (!request) return;
    setLoading(true);
    try {
      const updatedTransactionStatusBodyData = {
        transactionId: request.transactionId,
        transactionStatusId: status,
      };

      await apiService.updateTransaction(updatedTransactionStatusBodyData);
      onClose(); // Close the modal
      showNotification(status === 1
          ? "Transaction request has been approved."
          : "Transaction request has been rejected.", 'success')
      onClose();
    } catch (error: any) {
      showNotification(error?.message || "Something went wrong!", 'error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-8 py-6 border-b border-gray-200 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Withdraw Funds Request Details</h2>
              <p className="text-gray-600 mt-1">Transaction ID: {request.transactionId}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Status and Amount Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
              <div className="flex items-center space-x-3 mb-2">
                <ArrowDownLeft size={24} className="text-red-600" />
                <span className="text-sm font-medium text-red-700">Withdraw Amount</span>
              </div>
              <div className="text-3xl font-bold text-red-800">{formatAmountIndian(request.amount)}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-2">
                <StatusIcon size={24} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Status</span>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-2">
                <Tag size={24} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Tag</span>
              </div>
              <span className="inline-flex px-3 py-1 text-sm font-semibold bg-purple-100 text-purple-800 rounded-full border border-purple-200">
                {request.tag}
              </span>
            </div>
          </div>

          {/* Investor Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User size={20} className="mr-2 text-gray-600" />
              Investor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Investor Name</label>
                <div className="text-lg font-semibold text-gray-900">{request.investorName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                <div className="text-lg font-semibold text-gray-900">{request.userName}</div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard size={20} className="mr-2 text-gray-600" />
              Transaction Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Reference Number</label>
                <div className="text-gray-900 font-mono">{request.transactionRefNumber}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Request Type</label>
                <div className="text-gray-900">{request.requestType}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created Date</label>
                <div className="text-gray-900">{formatDate(request.createdAt)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Updated Date</label>
                <div className="text-gray-900">{formatDate(request.updatedAt)}</div>
              </div>
            </div>
          </div>

          {/* Withdrawal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign size={20} className="mr-2 text-gray-600" />
              Withdrawal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Withdraw Status</label>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${withdrawStatusInfo.color}`}>
                  {withdrawStatusInfo.label}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Withdrawn Amount</label>
                <div className="text-gray-900 font-semibold">{formatAmount(request.withdrawAmount)}</div>
              </div>
              {request.withdrawLastUpdated && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Withdraw Update</label>
                  <div className="text-gray-900">{formatDate(request.withdrawLastUpdated)}</div>
                </div>
              )}
              {request.withdrawTransactionReferenceIds.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Withdraw Reference IDs</label>
                  <div className="flex flex-wrap gap-2">
                    {request.withdrawTransactionReferenceIds.map((refId, index) => (
                      <span key={index} className="inline-flex px-3 py-1 text-xs font-mono bg-gray-100 text-gray-800 rounded-full border">
                        {refId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-gray-600" />
              Note
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{request.note}</p>
            </div>
          </div>

          {/* Transaction Image */}
          {request.transactionImage && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Image size={20} className="mr-2 text-gray-600" />
                Transaction Image
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <img
                  src={request.transactionImage}
                  alt="Transaction proof"
                  className="max-w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 rounded-b-2xl sticky bottom-0">
          <div className="flex justify-end">
            {
              request.transactionStatusId != 1 ? (
                <>
                <button 
                  disabled={loading}
                  onClick={()=>{handleTransaction(1)}}
                  className={`flex mr-5 items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <CheckCircle className='mr-2'/>
                    Approve
                </button>

                <button 
                  onClick={()=>{handleTransaction(2)}}
                  disabled={loading}
                    className={`flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-md ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <XCircle className='mr-2'/>
                    Reject
                </button>
                </>
              ) :
              (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              )
            }
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawFundsDetailDialog;