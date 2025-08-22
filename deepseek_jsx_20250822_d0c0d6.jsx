import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const VendorDashboard = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      newCustomers: 0
    },
    recentOrders: [],
    topProducts: [],
    notifications: []
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  // Mock API calls
  useEffect(() => {
    // Simulate authentication check
    const checkAuth = async () => {
      // In a real app, this would verify tokens with your backend
      const token = localStorage.getItem('vendorToken');
      if (token) {
        setIsAuthenticated(true);
        setUser({ name: 'Vendor User', email: 'vendor@example.com' });
        fetchDashboardData();
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, these would be actual API calls
      const summaryResponse = await fetch('/api/dashboard/summary');
      const ordersResponse = await fetch('/api/orders/recent');
      const productsResponse = await fetch('/api/products/top');
      const notificationsResponse = await fetch('/api/notifications');
      
      // Mock data for demonstration
      setDashboardData({
        summary: {
          totalSales: 12540,
          totalOrders: 289,
          totalProducts: 42,
          newCustomers: 56
        },
        recentOrders: [
          { id: '#ORD-7842', customer: 'Sarah Johnson', date: '2023-10-15', amount: 249.99, status: 'Delivered' },
          { id: '#ORD-7841', customer: 'Michael Chen', date: '2023-10-14', amount: 129.50, status: 'Processing' },
          { id: '#ORD-7840', customer: 'Emma Wilson', date: '2023-10-14', amount: 89.99, status: 'Shipped' },
          { id: '#ORD-7839', customer: 'James Rodriguez', date: '2023-10-13', amount: 459.00, status: 'Delivered' },
          { id: '#ORD-7838', customer: 'Lisa Taylor', date: '2023-10-13', amount: 199.99, status: 'Processing' }
        ],
        topProducts: [
          { id: 1, name: 'Wireless Headphones', sales: 142, stock: 56, price: 99.99 },
          { id: 2, name: 'Smart Watch', sales: 98, stock: 23, price: 199.99 },
          { id: 3, name: 'Bluetooth Speaker', sales: 87, stock: 41, price: 59.99 },
          { id: 4, name: 'Phone Case', sales: 76, stock: 189, price: 19.99 },
          { id: 5, name: 'USB-C Cable', sales: 65, stock: 256, price: 12.99 }
        ],
        notifications: [
          { id: 1, message: 'New order received', timestamp: '2023-10-15T10:30:00', read: false },
          { id: 2, message: 'Product running low on stock', timestamp: '2023-10-14T16:45:00', read: false },
          { id: 3, message: 'Payment processed successfully', timestamp: '2023-10-14T09:15:00', read: true }
        ]
      });
      
      setNotificationCount(2); // Unread notifications
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setIsLoading(false);
    }
  };

  // Authentication handlers
  const handleLogin = async (credentials) => {
    try {
      // In a real app, this would call your authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('vendorToken', data.token);
        setIsAuthenticated(true);
        setUser(data.user);
        fetchDashboardData();
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Order management functions
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update local state
        setDashboardData(prev => ({
          ...prev,
          recentOrders: prev.recentOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        }));
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status.');
    }
  };

  // Product management functions
  const addProduct = async (productData) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        const newProduct = await response.json();
        setDashboardData(prev => ({
          ...prev,
          topProducts: [...prev.topProducts, newProduct],
          summary: {
            ...prev.summary,
            totalProducts: prev.summary.totalProducts + 1
          }
        }));
        return true;
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product.');
      return false;
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        const updatedProduct = await response.json();
        setDashboardData(prev => ({
          ...prev,
          topProducts: prev.topProducts.map(product => 
            product.id === productId ? updatedProduct : product
          )
        }));
        return true;
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product.');
      return false;
    }
  };

  // Notification functions
  const markNotificationAsRead = (notificationId) => {
    setDashboardData(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => 
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    }));
    setNotificationCount(prev => prev - 1);
  };

  // Search and filter functions
  const filteredOrders = dashboardData.recentOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const filteredProducts = dashboardData.topProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chart data
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [1250, 1900, 2100, 2800, 2300, 3000, 3200, 3500, 4000, 4250],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const customerData = {
    labels: ['New', 'Returning'],
    datasets: [
      {
        data: [35, 65],
        backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)'],
        borderWidth: 1,
      },
    ],
  };

  const productPerformanceData = {
    labels: dashboardData.topProducts.map(p => p.name),
    datasets: [
      {
        label: 'Units Sold',
        data: dashboardData.topProducts.map(p => p.sales),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Render login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} isLoading={isLoading} />;
  }

  return (
    <div className="vendor-dashboard">
      <header className="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search orders or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button>🔍</button>
          </div>
          <button className="notification-btn">
            <i className="bell-icon">🔔</i>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>
          <div className="vendor-profile">
            <img src="https://ui-avatars.com/api/?name=Vendor+User&background=random" alt="Profile" />
            <span>{user?.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="sidebar">
          <ul>
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
              <i className="icon">📊</i> Overview
            </li>
            <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
              <i className="icon">📦</i> Products
            </li>
            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
              <i className="icon">🛒</i> Orders
            </li>
            <li className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>
              <i className="icon">👥</i> Customers
            </li>
            <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
              <i className="icon">📈</i> Analytics
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <i className="icon">⚙️</i> Settings
            </li>
          </ul>
        </nav>

        <main className="main-panel">
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab 
                  data={dashboardData} 
                  salesData={salesData}
                  customerData={customerData}
                />
              )}
              
              {activeTab === 'products' && (
                <ProductsTab 
                  products={filteredProducts}
                  onAddProduct={addProduct}
                  onUpdateProduct={updateProduct}
                />
              )}
              
              {activeTab === 'orders' && (
                <OrdersTab 
                  orders={filteredOrders}
                  filterStatus={filterStatus}
                  onFilterChange={setFilterStatus}
                  onUpdateOrderStatus={updateOrderStatus}
                />
              )}
              
              {activeTab === 'customers' && <CustomersTab />}
              {activeTab === 'analytics' && (
                <AnalyticsTab 
                  salesData={salesData}
                  customerData={customerData}
                  productPerformanceData={productPerformanceData}
                />
              )}
              
              {activeTab === 'settings' && <SettingsTab user={user} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Component for the login form
const LoginForm = ({ onLogin, isLoading }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(credentials);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Vendor Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Component for the Overview tab
const OverviewTab = ({ data, salesData, customerData }) => {
  return (
    <>
      <div className="summary-cards">
        <div className="card">
          <h3>Total Sales</h3>
          <div className="value">${data.summary.totalSales.toLocaleString()}</div>
          <div className="trend positive">+12.5% from last month</div>
        </div>
        <div className="card">
          <h3>Total Orders</h3>
          <div className="value">{data.summary.totalOrders}</div>
          <div className="trend positive">+8.3% from last month</div>
        </div>
        <div className="card">
          <h3>Total Products</h3>
          <div className="value">{data.summary.totalProducts}</div>
          <div className="trend">No change</div>
        </div>
        <div className="card">
          <h3>New Customers</h3>
          <div className="value">{data.summary.newCustomers}</div>
          <div className="trend positive">+15.7% from last month</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Sales Overview</h3>
          <Line 
            data={salesData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }}
          />
        </div>
        <div className="chart-card">
          <h3>Customer Distribution</h3>
          <Pie 
            data={customerData} 
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="recent-section">
        <div className="recent-orders">
          <h3>Recent Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.slice(0, 5).map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.date}</td>
                  <td>${order.amount}</td>
                  <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="top-products">
          <h3>Top Selling Products</h3>
          <ul>
            {data.topProducts.slice(0, 5).map((product, index) => (
              <li key={index}>
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <span className="product-sales">{product.sales} sold</span>
                </div>
                <div className="stock-info">
                  <span className="stock-label">Stock: {product.stock}</span>
                  <div className="stock-bar">
                    <div 
                      className="stock-level" 
                      style={{ width: `${Math.min(100, (product.stock / 200) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

// Component for the Products tab
const ProductsTab = ({ products, onAddProduct, onUpdateProduct }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    description: ''
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const success = await onAddProduct({
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock)
    });
    
    if (success) {
      setNewProduct({ name: '', price: '', stock: '', description: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="products-tab">
      <div className="tab-header">
        <h2>Product Management</h2>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>
          + Add Product
        </button>
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Product Name:</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-list">
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Sales</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>${product.price}</td>
                <td>{product.stock}</td>
                <td>{product.sales}</td>
                <td>
                  <button className="btn-secondary">Edit</button>
                  <button className="btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Component for the Orders tab
const OrdersTab = ({ orders, filterStatus, onFilterChange, onUpdateOrderStatus }) => {
  return (
    <div className="orders-tab">
      <div className="tab-header">
        <h2>Order Management</h2>
        <div className="filter-controls">
          <label>Filter by status:</label>
          <select value={filterStatus} onChange={(e) => onFilterChange(e.target.value)}>
            <option value="all">All</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-list">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>${order.amount}</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <select 
                    value={order.status} 
                    onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button className="btn-secondary">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Placeholder components for other tabs
const CustomersTab = () => (
  <div className="tab-content">
    <h2>Customer Management</h2>
    <p>This section would display customer information, order history, and communication tools.</p>
  </div>
);

const AnalyticsTab = ({ salesData, customerData, productPerformanceData }) => (
  <div className="analytics-tab">
    <h2>Analytics & Reports</h2>
    <div className="analytics-charts">
      <div className="chart-container">
        <h3>Sales Trend</h3>
        <Line 
          data={salesData} 
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
          }}
        />
      </div>
      <div className="chart-container">
        <h3>Product Performance</h3>
        <Bar 
          data={productPerformanceData} 
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
          }}
        />
      </div>
      <div className="chart-container">
        <h3>Customer Distribution</h3>
        <Pie 
          data={customerData} 
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
            },
          }}
        />
      </div>
    </div>
  </div>
);

const SettingsTab = ({ user }) => (
  <div className="settings-tab">
    <h2>Settings</h2>
    <div className="settings-section">
      <h3>Profile Settings</h3>
      <form>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" defaultValue={user?.name} />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" defaultValue={user?.email} />
        </div>
        <div className="form-group">
          <label>Store Name:</label>
          <input type="text" defaultValue="My Store" />
        </div>
        <button type="submit" className="btn-primary">Save Changes</button>
      </form>
    </div>
    
    <div className="settings-section">
      <h3>Notification Preferences</h3>
      <div className="preferences">
        <label>
          <input type="checkbox" defaultChecked /> Email notifications for new orders
        </label>
        <label>
          <input type="checkbox" defaultChecked /> Low stock alerts
        </label>
        <label>
          <input type="checkbox" defaultChecked /> Weekly sales reports
        </label>
      </div>
    </div>
  </div>
);

// CSS Styles
const styles = `
/* VendorDashboard.css */
.vendor-dashboard {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f7f9;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dashboard-header h1 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.search-box input {
  border: none;
  padding: 0.5rem;
  outline: none;
}

.search-box button {
  border: none;
  background: #f8f9fa;
  padding: 0.5rem;
  cursor: pointer;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.vendor-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vendor-profile img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.vendor-profile button {
  background: none;
  border: 1px solid #ddd;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.dashboard-content {
  display: flex;
  min-height: calc(100vh - 80px);
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 1.5rem 0;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sidebar li:hover {
  background-color: #34495e;
}

.sidebar li.active {
  background-color: #3498db;
}

.main-panel {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card h3 {
  margin: 0 0 0.5rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 600;
}

.card .value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.trend {
  font-size: 0.85rem;
}

.trend.positive {
  color: #2ecc71;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.chart-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.recent-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.recent-orders, .top-products {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.recent-orders h3, .top-products h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th, table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

table th {
  font-weight: 600;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.delivered {
  background-color: #e8f8f2;
  color: #27ae60;
}

.status-badge.processing {
  background-color: #fef9e7;
  color: #f39c12;
}

.status-badge.shipped {
  background-color: #eaf2f8;
  color: #3498db;
}

.status-badge.cancelled {
  background-color: #fdedec;
  color: #e74c3c;
}

.top-products ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.top-products li {
  padding: 1rem 0;
  border-bottom: 1px solid #ecf0f1;
}

.top-products li:last-child {
  border-bottom: none;
}

.product-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.product-name {
  font-weight: 600;
}

.product-sales {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stock-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.stock-bar {
  height: 6px;
  background-color: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
}

.stock-level {
  height: 100%;
  background-color: #2ecc71;
  border-radius: 3px;
}

/* Login Form */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7f9;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  margin: 0 0 1.5rem 0;
  text-align: center;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.login-form button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}

.login-form button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

/* Tab Styles */
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.tab-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-controls label {
  font-weight: 500;
}

.filter-controls select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.modal h3 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="button"] {
  background-color: #95a5a6;
  color: white;
}

.modal-actions button[type="submit"] {
  background-color: #3498db;
  color: white;
}

/* Analytics Tab */
.analytics-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-container h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

/* Settings Tab */
.settings-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.settings-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.preferences {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preferences label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #7f8c8d;
}

/* Responsive Styles */
@media (max-width: 992px) {
  .recent-section {
    grid-template-columns: 1fr;
  }
  
  .analytics-charts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 0;
  }
  
  .sidebar ul {
    display: flex;
    overflow-x: auto;
  }
  
  .sidebar li {
    padding: 1rem;
    white-space: nowrap;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .vendor-profile {
    flex-direction: column;
    gap: 0.5rem;
  }
}
`;

// Add the styles to the document
const styleSheet = document.createElement('style');
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default VendorDashboard;