# Footcap - Enhanced eCommerce Shoe Store

<div align="center">
  
  ![GitHub repo size](https://img.shields.io/github/repo-size/rutujajain123/footcap)
  ![GitHub stars](https://img.shields.io/github/stars/rutujajain123/footcap?style=social)
  ![GitHub forks](https://img.shields.io/github/forks/rutujajain123/footcap?style=social)

  <br />

  <h2 align="center">Modern eCommerce Website with Complete Shopping Experience</h2>

  Footcap is a fully responsive eCommerce website featuring advanced shopping cart functionality, user authentication, wishlist management, checkout system, and smooth navigation. Built with vanilla JavaScript, HTML5, and CSS3.

  **🔗 Repository:** [https://github.com/rutujajain123/footcap.git](https://github.com/rutujajain123/footcap.git)

<h3>Live Demo : https://68e010981450a767fa94ec9a--footcap1.netlify.app/</h3>

</div>

<br />

## 📖 Project Description

Footcap is a modern, feature-rich eCommerce platform specifically designed for footwear retail. The project demonstrates advanced frontend development skills with a complete shopping experience including user authentication, dynamic cart management, wishlist functionality, and an integrated checkout system. All prices are displayed in Indian Rupees (₹) targeting the Indian market.

### 🌟 Core Features

- **🔐 User Authentication System**: Secure signup/login with localStorage persistence
- **🛒 Advanced Shopping Cart**: Real-time updates with count badges and total calculations  
- **💖 Wishlist Management**: Save favorite products with heart icon toggles
- **💳 Complete Checkout System**: Customer details form with multiple payment options
- **🧭 Smooth Navigation**: Single-page scroll-to-section navigation
- **📱 Responsive Design**: Mobile-first approach with tablet and desktop optimization
- **✨ Interactive Animations**: Typing effects, hover animations, and smooth transitions
- **🇮🇳 Localized for India**: INR currency formatting and Indian payment methods

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Variables
- **Icons**: Ion Icons library
- **Storage**: localStorage for client-side data persistence
- **Development Server**: Python HTTP Server

## 📋 Prerequisites

- **Python 3.x** (for local development server)
- **Modern Web Browser** (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **Git** (for repository cloning)

## 🚀 Setup and Run Instructions

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/rutujajain123/footcap.git

# Navigate to project directory
cd footcap
```

### 2. Start Local Development Server

#### Option A: Python 3 (Recommended)
```bash
python -m http.server 8000
```

#### Option B: Python 2 (Fallback)
```bash
python -m SimpleHTTPServer 8000
```

#### Option C: Node.js (Alternative)
```bash
npx http-server -p 8000
```

### 3. Access the Application

Open your web browser and navigate to:
```
http://localhost:8000
```

The application will be available and ready to use immediately.

## 🧪 Test Cases and Instructions

### Automated Testing Setup

Currently, the project uses manual testing. For automated testing setup:

```bash
# Future implementation - Jest testing framework
npm install --save-dev jest
npm test
```

### Manual Testing Scenarios

#### 1. Authentication System Testing

**Test Case 1.1: User Registration**
```
Steps:
1. Click "Sign Up" button in navigation
2. Fill form: Name="Test User", Email="test@example.com", Password="test123"
3. Click "Create Account"

Expected Results:
✅ Success message appears
✅ User automatically logged in
✅ Navigation shows "Welcome, Test User"
✅ Cart and wishlist icons appear in navbar
```

**Test Case 1.2: User Login**
```
Steps:
1. Click "Login" (if signed out)
2. Enter valid credentials
3. Click "Login"

Expected Results:
✅ Login successful message
✅ User session persists after page refresh
✅ User-specific cart and wishlist load
```

#### 2. Shopping Cart Testing

**Test Case 2.1: Add Items to Cart**
```
Prerequisites: User must be logged in

Steps:
1. Scroll to product section
2. Click cart icon on any product
3. Verify notification: "[Product Name] added to cart!"
4. Check cart icon in navbar

Expected Results:
✅ Red notification appears with black text
✅ Cart count badge shows correct number
✅ Cart icon displays red badge with black number
```

**Test Case 2.2: Cart Modal Functionality**
```
Steps:
1. Add 2-3 different products to cart
2. Click cart icon in navbar
3. Verify cart modal opens with smooth animation
4. Check individual items and total calculation

Expected Results:
✅ Modal slides in from right
✅ All added products visible with correct details
✅ Quantities and prices accurate (in ₹)
✅ Total calculation correct
✅ "Checkout" button visible and styled
```

#### 3. Wishlist Testing

**Test Case 3.1: Add to Wishlist**
```
Prerequisites: User must be logged in

Steps:
1. Click heart icon on any product
2. Verify heart turns red and fills
3. Click wishlist icon in navbar
4. Verify wishlist modal opens

Expected Results:
✅ Heart icon changes from outline to filled red
✅ Wishlist count badge appears
✅ Product appears in wishlist modal
✅ Can remove items from wishlist
```

#### 4. Checkout Process Testing

**Test Case 4.1: Complete Checkout Flow**
```
Prerequisites: Items in cart

Steps:
1. Open cart modal
2. Click "Checkout" button
3. Fill all required fields:
   - Full Name: "John Doe"
   - Phone: "+91 9876543210"
   - Address: "123 Main St, Mumbai, India"
   - Payment Method: Select "Google Pay"
4. Click "Order Now"

Expected Results:
✅ Checkout form opens with smooth transition
✅ All form fields properly validated
✅ Payment options displayed correctly
✅ Order summary shows correct items and total
✅ Order confirmation appears with order ID
✅ Cart cleared after successful order
```

#### 5. Navigation Testing

**Test Case 5.1: Smooth Scrolling**
```
Steps:
1. Click each navbar link: Home, About, Products, Shop, Blog, Contact
2. Observe scrolling behavior
3. Check active link highlighting

Expected Results:
✅ Smooth scrolling to correct sections
✅ Active navigation link highlighted
✅ Proper offset for fixed header
```

### Browser Console Testing

Open browser console (F12) and test with JavaScript:

```javascript
// Test cart functionality
debugCart(); // Shows current cart state
clearCart(); // Clears all items

// Test wishlist functionality  
debugWishlist(); // Shows wishlist state
openWishlist(); // Opens wishlist modal

// Test authentication
console.log('Current user:', authSystem.getCurrentUser());
console.log('Is logged in:', authSystem.isLoggedIn());
```

### Performance Testing

**Test Case 6.1: Page Load Performance**
```
Steps:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page (Ctrl+F5)
4. Check load times

Expected Results:
✅ Initial load < 3 seconds
✅ All images load properly
✅ No JavaScript errors in console
✅ Smooth animations without lag
```

### Cross-Browser Testing

Test on multiple browsers:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### Mobile Responsiveness Testing

Test on different screen sizes:
- ✅ Mobile (320px - 768px)
- ✅ Tablet (768px - 1024px)  
- ✅ Desktop (1024px+)

## 🎯 Design Choices and Assumptions

### Technical Architecture Decisions

**1. Vanilla JavaScript Choice**
```
Reasons:
✅ No external dependencies or build process
✅ Faster page load times
✅ Better performance on mobile devices
✅ Easier to understand and maintain
✅ Direct browser API access
```

**2. localStorage for Data Persistence**
```
Assumptions:
- No backend server available for this demo
- Users accept client-side data storage
- Data loss acceptable if browser cache cleared
- Sufficient for portfolio/demo purposes

Benefits:
✅ Instant data access
✅ Works offline
✅ No server costs
✅ User-specific data separation
```

**3. Component-Based Architecture**
```
Structure:
- AuthSystem: User authentication and session management
- CartSystem: Shopping cart functionality and persistence  
- WishlistSystem: Favorite products management
- NavigationSystem: Smooth scrolling and active states

Reasoning:
✅ Modular and maintainable code
✅ Separation of concerns
✅ Reusable components
✅ Easy to test and debug
```

### UI/UX Design Decisions

**1. Indian Market Localization**
```
Choices:
- Currency: Indian Rupees (₹) instead of USD
- Payment Methods: Paytm, GPay, PhonePe, Cash on Delivery
- Phone number field for delivery contact

Assumptions:
- Target audience: Indian consumers
- Local payment preferences matter
- Mobile payments are popular in India
```

**2. Authentication-Required Features**
```
Design Choice: Cart and wishlist require login

Reasoning:
✅ Provides personalized user experience
✅ Prevents data loss between sessions
✅ Enables user-specific functionality
✅ Demonstrates full-stack thinking
```

**3. Visual Feedback Systems**
```
Implementations:
- Count badges on cart/wishlist icons
- Color changes for interactive states
- Toast notifications for user actions
- Loading states and transitions

Purpose:
✅ Clear user feedback
✅ Professional user experience
✅ Reduced user confusion
✅ Modern app-like feel
```

### Project Scope Assumptions

**1. Demo/Portfolio Purpose**
```
Assumptions:
- Real payment integration not required
- Admin panel not needed for demo
- Basic error handling sufficient
- Client-side validation acceptable
```

**2. Target Users**
```
Assumptions:
- Users have modern browsers
- JavaScript enabled
- Basic tech literacy
- Mobile-first usage patterns
```

**3. Data Management**
```
Assumptions:
- Small product catalog sufficient
- No real-time inventory needed
- Static product data acceptable
- No complex filtering required
```

## 📁 Project Structure

```
footcap/
├── assets/
│   ├── css/
│   │   └── style.css              # Main stylesheet (2000+ lines)
│   ├── js/
│   │   ├── script.js              # Core website functionality
│   │   ├── auth.js                # Authentication system
│   │   ├── cart.js                # Shopping cart management
│   │   ├── wishlist.js            # Wishlist functionality
│   │   ├── navigation.js          # Smooth scrolling navigation
│   │   └── typing-effect.js       # Hero text animations
│   └── images/                    # Product images and assets
├── index.html                     # Main HTML structure
├── README.md                      # This documentation
└── .git/                         # Git repository data
```

## 🔧 Configuration Options

### Customizable Settings

```javascript
// Currency settings (in cart.js)
const CURRENCY_SYMBOL = '₹';
const LOCALE = 'en-IN';

// Animation speeds (in typing-effect.js)
const TYPING_SPEED = 100; // milliseconds per character
const PAUSE_BETWEEN_WORDS = 500; // milliseconds

// Session management (in auth.js)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
```

## 🐛 Known Limitations

1. **Data Persistence**: Browser-dependent storage (lost on cache clear)
2. **Payment Integration**: Demo purposes only (no real transactions)
3. **Scalability**: Not optimized for large product catalogs
4. **Backend**: No server-side validation or processing
5. **SEO**: Limited SEO optimization as single-page app

## 🚀 Future Enhancements

- [ ] Backend API integration
- [ ] Real payment gateway integration  
- [ ] Product search and filtering
- [ ] User reviews and ratings
- [ ] Order tracking system
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - free to use and modify.

## 👤 Author

**Rutuja Jain**
- GitHub: [@rutujajain123](https://github.com/rutujajain123)
- Repository: [footcap](https://github.com/rutujajain123/footcap)
- Email: rutujajain401@gmail.com

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for the developer community

</div>
