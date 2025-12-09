/**
 * Performance Benchmark Script
 * Tests MongoDB query performance vs old in-memory approach
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function benchmark() {
  console.log('\n🚀 MONGODB PERFORMANCE BENCHMARK\n');
  console.log('━'.repeat(60));

  const tests = [
    {
      name: 'Query without filters (full dataset)',
      params: {
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 10,
        filters: JSON.stringify({
          customerRegion: [],
          gender: [],
          ageRange: { min: 0, max: 100 },
          productCategory: [],
          tags: [],
          paymentMethod: [],
          dateRange: { start: null, end: null }
        })
      }
    },
    {
      name: 'Query with 1 filter (Region: South)',
      params: {
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 10,
        filters: JSON.stringify({
          customerRegion: ['South'],
          gender: [],
          ageRange: { min: 0, max: 100 },
          productCategory: [],
          tags: [],
          paymentMethod: [],
          dateRange: { start: null, end: null }
        })
      }
    },
    {
      name: 'Query with 2 filters (South + Female)',
      params: {
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 10,
        filters: JSON.stringify({
          customerRegion: ['South'],
          gender: ['Female'],
          ageRange: { min: 0, max: 100 },
          productCategory: [],
          tags: [],
          paymentMethod: [],
          dateRange: { start: null, end: null }
        })
      }
    },
    {
      name: 'Query with 3 filters (South + Female + Age 51+)',
      params: {
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 10,
        filters: JSON.stringify({
          customerRegion: ['South'],
          gender: ['Female'],
          ageRange: { min: 51, max: 100 },
          productCategory: [],
          tags: [],
          paymentMethod: [],
          dateRange: { start: null, end: null }
        })
      }
    },
    {
      name: 'Query with search (customer name)',
      params: {
        search: 'Neha',
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 10,
        filters: JSON.stringify({
          customerRegion: [],
          gender: [],
          ageRange: { min: 0, max: 100 },
          productCategory: [],
          tags: [],
          paymentMethod: [],
          dateRange: { start: null, end: null }
        })
      }
    }
  ];

  for (const test of tests) {
    try {
      const start = Date.now();
      const response = await axios.get(`${API_URL}/transactions`, { params: test.params });
      const duration = Date.now() - start;

      const { pagination, aggregateStats } = response.data.data;

      console.log(`\n📊 ${test.name}`);
      console.log(`   ⏱️  Response Time: ${duration}ms`);
      console.log(`   📈 Total Records: ${aggregateStats.recordCount.toLocaleString()}`);
      console.log(`   📄 Page Size: ${pagination.pageSize}`);
      console.log(`   💰 Total Amount: ₹${Math.round(aggregateStats.totalAmount).toLocaleString()}`);
      console.log(`   🛍️  Total Units: ${aggregateStats.totalUnits.toLocaleString()}`);

    } catch (error) {
      console.error(`\n❌ ${test.name}`);
      console.error(`   Error: ${error.message}`);
    }
  }

  console.log('\n' + '━'.repeat(60));
  console.log('\n✅ Benchmark Complete!\n');
}

benchmark().catch(console.error);

