import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { StatsCards } from './components/StatsCards';
import { TransactionTable } from './components/TransactionTable';
import { Pagination } from './components/Pagination';
import { 
  fetchTransactions, 
  selectSearch,
  selectSort,
  selectPagination,
  selectTransactions,
  selectAggregateStats,
  setSearch
} from './store/slices/transactionSlice';
import { selectActiveFilters } from './store/slices/filterSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const search = useSelector(selectSearch);
  const { sortBy, sortOrder } = useSelector(selectSort);
  const { currentPage, pageSize, totalItems } = useSelector(selectPagination);
  const filters = useSelector(selectActiveFilters);
  const transactions = useSelector(selectTransactions);
  const aggregateStats = useSelector(selectAggregateStats);
  const [searchTerm, setSearchTerm] = useState(search);

  // Use aggregate stats from backend (based on all filtered data, not just current page)
  const stats = useMemo(() => {
    return {
      totalIncome: aggregateStats.totalAmount || 0,
      totalOrders: aggregateStats.totalUnits || 0,
      totalDiscount: aggregateStats.totalDiscount || 0,
      totalRecords: aggregateStats.recordCount || 0
    };
  }, [aggregateStats]);

  // Fetch transactions when search, filters, sort, or pagination changes
  useEffect(() => {
    dispatch(fetchTransactions({
      search,
      filters,
      sortBy,
      sortOrder,
      page: currentPage,
      pageSize,
    }));
  }, [dispatch, search, filters, sortBy, sortOrder, currentPage, pageSize]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSearch(searchTerm));
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTransactions({
      search,
      filters,
      sortBy,
      sortOrder,
      page: currentPage,
      pageSize,
    }));
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  return (
    <div className="app">
      <Sidebar />
      
      <main className="app-main">
        <TopBar 
          onRefresh={handleRefresh}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        
        <StatsCards stats={stats} />
        
        <div className="content-section">
          <div className="table-section">
            <TransactionTable />
          </div>
          
          <div className="pagination-section">
            <Pagination />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

