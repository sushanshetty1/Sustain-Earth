# 🌍 SustainEarth - Empowering Sustainable Development

Welcome to **SustainEarth**, a platform dedicated to creating a better and more sustainable future. Our mission is to address three critical **Sustainable Development Goals (SDGs)**:  
- **No Hunger (SDG 2)**  
- **Quality Education (SDG 4)**  
- **Decent Work and Economic Growth (SDG 8)**  

Through **FoodHub**, **Learn&Share**, and **MarketPlace**, we're building a community that drives positive change!

---

## 🚀 Platform Sections

### 🍽️ **FoodHub**  
_Fighting hunger, one meal at a time!_

FoodHub focuses on reducing food waste and redistributing meals to those in need.  

- **Share**: If you're an individual or a restaurant with excess food, post it here to help others.  
- **Find**: View available food listings to help NGOs locate food donations based on location, quantity, and other details.  
- **Alert**: View and share food donation needs via **Leaflet** and **OpenStreetMap** APIs, helping NGOs track food requirements across regions.  

---

### 📚 **Learn&Share**  
_Opening doors to quality education for all!_

Learn&Share connects students, teachers, and professionals to foster peer-to-peer learning and mentorship.  

- **Learn**: A platform for students to receive classes, earn certificates, and for professionals to teach either paid or free classes.  
- **Forums**: Discuss educational topics, share knowledge, and engage in meaningful conversations.  
- **Articles**: Stay up-to-date with the latest trends and news in the education sector, powered by an API integration.  

---

### 🛒 **MarketPlace**  
_Bringing economic growth through eco-friendly trade and exchanges!_

MarketPlace promotes sustainability by encouraging the reuse and trade of goods.  

- **GreenMarket**: Browse products labeled for **Sale**, **Rent**, or **Both**. Choose to buy directly or **Trade** based on product value.  
- **SellNRent**: A platform to list your items, track orders, and manage trade requests.  
- **QuickAsk**: Request resources from your community to reduce waste and promote a stable economy.  

---

## 💎 **Premium & Free Model**

We offer two subscription tiers to suit user needs:  

- **Free Tier**: All users start with 3 days of premium access.  
- **Premium Tier**: Unlock exclusive features like access to paid classes in Learn&Share and advanced privileges in the Marketplace.  

---

## 🪙 **The Coin System**

Earn **SustainEarth Coins** by contributing to the platform and engaging with the community! Coins can be used to unlock features, climb the **Leaderboard**, or participate in special challenges.  

- **For Donations**:  
  - ₹250 donated = 25 coins  
  - Every meal donated = 12 coins  

- **Learn&Share Contributions**:  
  - **Forums**:  
    - Every post in forums = 25 coins  
    - For every 100 views = 5 coins  
    - For every 25 likes = 5 coins  
  - **Classes**:  
    - Upload a class in Learn = 25 coins  

- **Daily Coin Limit**:  
  - Free Tier: 250 coins  
  - Premium Tier: 350 coins  

Track your progress and celebrate your impact on the **Leaderboard**, where you can compete with friends and the community. 🎉  

---

## 📊 **User Dashboard**

The **User Dashboard** provides insights into your activities and progress on the platform. Key features include:  

- **Contributions Overview**: Track your donations, posts, classes, and Marketplace activity.  
- **Coin Balance**: View your total coin earnings and daily progress towards the coin limit.  
- **Leaderboard Status**: See your position among community members based on coin earnings.  
- **Progress Graph**: Compare your coin earnings with friends through an intuitive, real-time graphical representation.  

  - **Free Tier**: Add and compare progress with **1 friend**.  
  - **Premium Tier**: Add and compare progress with **unlimited friends**.  

The Progress Graph fosters healthy competition and motivates you to contribute more to the **SustainEarth** community.  

---

## 🛠️ **Tech Stack**

SustainEarth leverages modern technologies for a seamless experience:  

- **Next.js**: Fast, scalable React framework with server-side rendering.  
- **Tailwind CSS**: Utility-first CSS framework for sleek and responsive UI.  
- **Firebase**: Real-time database for efficient data management and synchronization.  

---

## 💡 **Contributing**

We welcome contributors who are passionate about sustainability and making a positive impact. To contribute:  

1. Fork the repository.  
2. Create a new branch for your changes.  
3. Make your changes and commit them.  
4. Open a pull request and provide a detailed description.  

Together, we can build a sustainable future! 🌱  

---

## ▶️ **How to Run the Program**

Follow these steps to set up and run **SustainEarth** locally:  

### 1. Clone the Repository  

```bash  
git clone https://github.com/sushanshetty1/sustainearth.git  
cd sustainearth  
```
2. Install Dependencies
Ensure you have Node.js and npm installed. Then run:

```bash
npm install
```  
3. Set Up Firebase
Go to the Firebase Console.
Create a new project and configure a real-time database.
Copy the Firebase configuration and create a .env.local file in your project root:
env
Copy code
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>  
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-auth-domain>  
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>  
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>  
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-messaging-sender-id>  
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>  
5. Run the Development Server
Start the application in development mode:

```bash
npm run dev
```
The application will be available at http://localhost:3000.

5. Build for Production
For a production-ready build, use:

```bash
npm run build  
npm start
```  
📬 Contact Us
Have suggestions or want to collaborate? Reach out to us at:
Email: sushanshetty1470@gmail.com

"Small actions create big changes. Join us in building a sustainable future."
