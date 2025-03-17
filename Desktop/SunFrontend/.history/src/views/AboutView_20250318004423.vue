<template>
  <div class="about-view">
    <header class="about-header">
      <img src="@/assets/logo.png" alt="Mindwell Healthcare Logo" class="logo" />
      <h1>About Us</h1>
    </header>

    <div class="about-content">
      <div class="images-section">
        <img src="@/assets/about-us-1.png" alt="Counseling Session" class="about-image" />
        <img src="@/assets/about-us-2.png" alt="Healthcare Team" class="about-image" />
        <img src="@/assets/about-us-3.png" alt="Support Group" class="about-image" />
      </div>

      <p class="about-description">
        Welcome to UV-SAFE, your go-to platform for sun protection awareness and personalized recommendations.  

        We are dedicated to educating users about the harmful effects of neglecting sun protection and empowering them with the right tools to safeguard their skin. 
        Prolonged exposure to UV radiation can lead to premature aging, sunburns, and even serious health concerns like skin cancer. 
        That’s why we provide tailored recommendations based on your *skin type and skin tone*, helping you choose the best sun protection strategies that suit your needs.  

        What We Offer:
        *Personalized Sun Protection Advice* – Get expert recommendations on sunscreen, protective clothing, and skincare based on your skin type and color.  
        *UV Index Insights* – Stay informed about real-time UV levels in your area and take necessary precautions.  
        *Clothing Recommendations* – Learn about the best fabrics, colors, and UPF-rated clothing to shield your skin effectively.  
        *Awareness & Education* – Understand the long-term consequences of UV exposure and adopt smart sun safety habits.

        At UV-SAFE, we believe *prevention is better than cure*. Protect your skin today for a healthier tomorrow! 🌞  

        Stay safe, stay sun-smart!
      </p>

      <div class="contact-info">
        <div class="contact-item">
          <strong>Address</strong>
          <p>MCITY Clayton 3168 VIC</p>
        </div>
        <div class="contact-item">
          <strong>Email</strong>
          <p>contact@mindwell.com</p>
        </div>
        <div class="contact-item">
          <strong>Tel</strong>
          <p>+61 430030118</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.about-view {
  text-align: center;
  padding: 20px;
}

.about-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.logo {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.about-content {
  margin: 0 auto;
  max-width: 800px;
}

.images-section {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.about-image {
  width: 30%;
  border-radius: 8px;
}

.about-description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
}

.contact-info {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.contact-item {
  text-align: left;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>