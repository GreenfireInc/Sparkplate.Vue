<template>
  <!-- This is the HTML section of PageOne.vue file -->
  <div class="view">
    <!-- Defining the heading content and its className -->
    <h1 class="view-name">Education</h1>
    <div class="d-flex justify-center align-items-center m-2 pt-10">
      <h3 class="cryptoTitle"><b>What is Cryptocurrency?</b></h3>
    </div>
    <div class="d-flex justify-center align-items-center">
      <img
        src="/assets/icons/coin.svg"
        class="digital-coin"
        alt="Digital Coin"
      />
      <img
        src="/assets/icons/coin.svg"
        class="digital-coin"
        alt="Digital Coin"
      />
      <img
        src="/assets/icons/coin.svg"
        class="digital-coin"
        alt="Digital Coin"
      />
      <img
        src="/assets/icons/coin.svg"
        class="digital-coin"
        alt="Digital Coin"
      />
      <img
        src="/assets/icons/coin.svg"
        class="digital-coin"
        alt="Digital Coin"
      />
    </div>
    <div class="d-flex justify-center align-items-center m-2 p-10">
      <aside class="text-justify-right" style="display: block">
        <big><b>C</b></big
        >ryptocurrency is a form of digital or virtual currency that operates on
        decentralized networks using blockchain technology. Unlike traditional
        currencies issued by governments, cryptocurrencies rely on cryptographic
        techniques for security and operate independently of a central
        authority. The decentralized nature of cryptocurrencies ensures
        transparency, immutability, and global accessibility. Transactions are
        verified by a network of participants through a distributed ledger,
        offering a level of security and transparency not seen in traditional
        financial systems.
        <br />
        <br />
        <center>
          <fragment style="font-style: italic; color: cadetblue"
            >"The decentralized nature of cryptocurrencies ensures transparency,
            immutability, and global accessibility."
          </fragment>
          <br />
          <br />
        </center>
        <fragment>
          For more information about resources that will give you a deeper
          understanding about Cryptocurrency, take a look at the following
          suggestions:
          <a href="https://saifedean.com/tbs" class="bookLink" target="_blank"
            >The Bitcoin Standard</a
          >,
          <a
            href="https://coreydesir.gumroad.com/l/CryptoAlphabet"
            class="bookLink"
            target="_blank"
            >Cryptocurrency Alphabet</a
          >,
          <a href="https://aantonop.com/" class="bookLink" target="_blank"
            >The Bitcoin & Open Blockchain Expert</a
          >.
        </fragment>
      </aside>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageOne'
}
</script>

<style>
h3.cryptoTitle {
  font-family: Georgia, 'Times New Roman', Times, serif;
  color: #0f52ba;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}
.imgCoin {
  align-self: center;
}
a.bookLink:link {
  font-family: 'Clarkson', Helvetica, sans-serif;
  font-style: normal;
  font-weight: 500;
  line-height: 1.3em;
  letter-spacing: 0;
  text-rendering: geometricPrecision;
  text-decoration: none;
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  padding-bottom: 0.5px;
  background-repeat: no-repeat;
  background-image:
    -webkit-gradient(
      linear,
      left top,
      left bottom,
      from(currentColor),
      to(currentColor)
    ),
    -webkit-gradient(linear, left top, left bottom, from(currentColor), to(currentColor));
  background-image: linear-gradient(currentColor, currentColor),
    linear-gradient(currentColor, currentColor);
  background-size:
    51% 2px,
    50% 2px;
  background-position:
    0 100%,
    100% 100%;
  background-color: transparent;
  display: inline-block;
  -webkit-box-align: end;
  -ms-flex-align: end;
  align-items: flex-end;
  cursor: pointer;
  color: #000;
  margin-top: 6px;
}
a.bookLink:after {
  background-color: red;
  text-decoration: none;
}
</style>
