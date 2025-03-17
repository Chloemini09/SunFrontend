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
        We are a charitable organization dedicated to supporting individuals struggling with mental health challenges.
        Our mission is to provide compassionate care, resources, and advocacy for those affected by mental illness.
        Through counseling services, support groups, and community outreach programs, we strive to promote mental well-being
        and reduce stigma surrounding mental health issues. Our goal is to empower individuals on their journey to recovery
        and create a society where everyone has access to the mental health support they need.
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