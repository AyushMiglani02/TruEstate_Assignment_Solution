import { useSelector } from 'react-redux';
import { selectTransactions, selectLoading, selectError } from '../../store/slices/transactionSlice';
import { LoadingSkeleton } from '../LoadingSkeleton';
import './TransactionTable.css';

/**
 * TransactionTable component for displaying transaction data
 * @returns {JSX.Element}
 */
export function TransactionTable() {
  const transactions = useSelector(selectTransactions);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  if (loading) {
    return <LoadingSkeleton type="table" count={10} />;
  }

  if (error) {
    return (
      <div className="table-state error" role="alert">
        <p className="error-icon" aria-hidden="true">⚠️</p>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="table-state">
        <p className="empty-icon" aria-hidden="true">📭</p>
        <p>No transactions found</p>
        <p className="empty-hint">Try adjusting your filters or search</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return `₹ ${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="table-container">
      <div className="table-wrapper" role="region" aria-label="Transactions table">
        <table className="transaction-table">
          <thead>
            <tr>
              <th scope="col">Transaction ID</th>
              <th scope="col">Date</th>
              <th scope="col">Customer ID</th>
              <th scope="col">Customer name</th>
              <th scope="col">Phone Number</th>
              <th scope="col">Gender</th>
              <th scope="col">Age</th>
              <th scope="col">Product Category</th>
              <th scope="col">Quantity</th>
              <th scope="col">Total Amount</th>
              <th scope="col">Customer region</th>
              <th scope="col">Product ID</th>
              <th scope="col">Employee name</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={transaction.transactionId || index}>
                <td data-label="Transaction ID">{transaction.transactionId}</td>
                <td data-label="Date">{transaction.date}</td>
                <td data-label="Customer ID">{transaction.customerId}</td>
                <td data-label="Customer name">{transaction.customerName}</td>
                <td data-label="Phone Number">
                  <div className="phone-cell">
                    {transaction.phoneNumber}
                    <button 
                      className="copy-button"
                      onClick={() => copyToClipboard(transaction.phoneNumber)}
                      aria-label="Copy phone number"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.6667 2H3.33333C2.59695 2 2 2.59695 2 3.33333V10.6667C2 11.403 2.59695 12 3.33333 12H10.6667C11.403 12 12 11.403 12 10.6667V3.33333C12 2.59695 11.403 2 10.6667 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 14H12.6667C13.403 14 14 13.403 14 12.6667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
                <td data-label="Gender">{transaction.gender}</td>
                <td data-label="Age">{transaction.age}</td>
                <td data-label="Product Category">{transaction.productCategory}</td>
                <td data-label="Quantity">{transaction.quantity}</td>
                <td data-label="Total Amount">{formatCurrency(transaction.totalAmount || transaction.finalAmount)}</td>
                <td data-label="Customer region">{transaction.customerRegion}</td>
                <td data-label="Product ID">{transaction.productId}</td>
                <td data-label="Employee name">{transaction.employeeName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-footer-text" aria-live="polite">
        Displaying {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

