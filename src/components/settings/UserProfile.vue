<template>
  <form style="padding-bottom: 80px" @submit.prevent>
    <div>
      <div class="row">
        <div class="col-md-9">
          <p class="text-xl mb-5">User Profile</p>
        </div>
      </div>
      <!-- first name -->
      <div class="max-w-2xl">
        <div>
          <div class="input-group">
            <!-- first name -->
            <div class="input-field col-md-6 pl-0">
              <label for="settings_user-fname">Firstname</label>
              <input
                id="settings_user_fname"
                v-model="user.firstname"
                class="form-control"
                type="text"
                :disabled="isDisabled"
              />
            </div>

            <!-- last name -->
            <div class="input-field col-md-6 pr-0">
              <label for="settings_user-lname">Lastname</label>
              <input
                id="settings_user_lname"
                v-model="user.lastname"
                class="form-control"
                type="text"
                :disabled="isDisabled"
              />
            </div>
          </div>

          <div class="input-group">
            <!-- company -->
            <div class="input-field col-md-6 pl-0">
              <label for="settings_user-company">Company</label>
              <input
                ref="settings_user_company"
                v-model="user.company"
                class="form-control"
                type="text"
                :disabled="userProfileType !== 'company'"
              />
            </div>

            <!-- email address -->
            <div class="input-field col-md-6 pr-0">
              <label for="settings_user-email">Email</label>
              <input
                id="settings_user_email"
                v-model="user.email"
                class="form-control"
                type="email"
                :disabled="isDisabled"
              />
            </div>
          </div>

          <div class="input-group">
            <!-- user address -->
            <div class="input-field col-md-6 pl-0">
              <label for="settings_user-address">Address</label>
              <input
                ref="settings_user_address"
                v-model="user.address"
                class="form-control"
                type="text"
                :disabled="isDisabled"
              />
            </div>

            <!-- City -->
            <div class="input-field col-md-6 pr-0">
              <label for="settings_phone_number">City</label>
              <input
                id="settings_city"
                ref="settings_city"
                v-model="user.city"
                type="text"
                class="form-control"
                :disabled="isDisabled"
                @input="getTimeZone($event)"
              />
            </div>
          </div>

          <!-- EXTRA DETAILS FORM -->
          <div class="mt-3 mb-3">
            <!-- <p class="text-xl mb-5">Extra</p> -->
          </div>

          <div class="input-group">
            <!-- country -->
            <div class="input-field col-md-6 pl-0">
              <label for="settings_user-country">Country</label>
              <select
                v-model="user.country"
                class="form-control"
                :disabled="isDisabled"
                @change="
                  getStateByCountryId($event)
                  getTimeZone($event)
                "
              >
                <option value="" selected>Choose Country</option>
                <option
                  v-for="country in countries"
                  :key="country.id"
                  :value="country.id"
                >
                  {{ country.name }}
                </option>
              </select>
            </div>

            <!-- state/province -->
            <div class="input-field col-md-6 pr-0">
              <label for="settings_user_state">State/Province</label>
              <select
                v-model="user.stateProvince"
                class="form-control"
                :disabled="isDisabled"
              >
                <option value="" selected>Choose State</option>
                <option
                  v-for="state in states"
                  :key="state.id"
                  :value="state.id"
                >
                  {{ state.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="input-group">
            <!-- zip code -->
            <div class="input-field col-md-6 pl-0">
              <label for="settings_user_zipcode">Zipcode</label>
              <input
                id="settings_user_zipcode"
                v-model="user.zip"
                class="form-control"
                type="text"
                :disabled="isDisabled"
              />
            </div>

            <!-- timezone -->
            <div class="input-field col-md-6 pr-0">
              <label for="settings_user_timezone">Timezone</label>
              <input
                id="settings_user_timezone"
                :key="user.timezone"
                v-model="user.timezone"
                class="form-control"
                type="text"
                :disabled="isDisabled"
              />
            </div>
          </div>
        </div>
        <div>
          <div class="input-group">
            <!-- currency -->
            <div class="input-field col-md-6 pl-0">
              <!-- tooltip for currency  -->
              <button
                v-tooltip="{
                  content:
                    'You must log in again after changing this field for the change to take effect'
                }"
                class="tooltip-custom"
              >
                ?
              </button>
              <label for="settings_user_currency">{{
                `Currency (${getSymbolFromCurrency(user.currency)})`
              }}</label>
              <input
                id="settings_user_currency"
                v-model="user.currency"
                class="form-control"
                type="text"
                disabled
              />
            </div>
            <!-- global currency -->
            <div class="input-field col-md-6 pr-0">
              <!-- tooltip and toggle for global currency  -->
              <div class="flex justify-between">
                <button
                  v-tooltip="{
                    content:
                      'You must log in again after changing this field for the change to take effect'
                  }"
                  class="tooltip-custom"
                >
                  ?
                </button>
                <div class="flex items-center">
                  <label for="settings_global_currency_type" class="mb-0">
                    {{ globalCurrencyType }}
                  </label>
                  <toggle-button
                    id="settings_global_currency_type"
                    v-model="globalCurrencyIsFiat"
                    :sync="true"
                    :value="globalCurrencyIsFiat"
                    :disabled="isDisabled"
                    color="#3182ce"
                  />
                </div>
              </div>
              <label for="settings_user_currency"
                >Global Currency (<CurrencySymbol
                  :symbol="user.globalCurrency"
                />)</label
              >
              <select
                v-model="user.globalCurrency"
                class="form-control"
                :disabled="isDisabled"
                @change="selectGlobalCurrency($event)"
              >
                <!-- grouping and displaying currency options-->
                <option value="" selected>Choose Currency</option>
                <option
                  v-for="currency in globalCurrencyList"
                  :key="currency + '-globalCurrencyOption'"
                  :value="currency"
                >
                  {{ getDisplayCurrencyFormat(currency) }}
                </option>
              </select>
            </div>
            <!-- unstoppable domain -->
            <div class="input-field col-md-6 pl-0">
              <label for="settings_user_currency"
                ><a href="https://bit.ly/3tFKr32" target="_blank"
                  >Unstoppable Domain</a
                ></label
              >
              <input
                id="settings_user_udomain"
                v-model="user.udomain"
                class="form-control"
                type="text"
                :disabled="isDisabled"
              />
            </div>
            <!-- website -->
            <div class="input-field col-md-6 pr-0">
              <label for="settings_user_currency">Website</label>
              <input
                id="settings_user_website"
                v-model="user.website"
                class="form-control"
                type="text"
                :disabled="isDisabled"
              />
            </div>
            <!-- twitter -->
            <div class="input-field col-md-6 pl-0">
              <label for="settings_user_currency">Twitter Handle</label>
              <input
                id="settings_user_twitter"
                v-model="user.twitter"
                class="form-control"
                type="text"
                :disabled="isDisabled"
              />
            </div>
            <!-- instagram -->
            <div class="input-field col-md-6 pr-0">
              <label for="settings_user_currency">Instagram Handle</label>
              <input
                id="settings_user_instagram"
                v-model="user.instagram"
                class="form-control"
                type="text"
                :disabled="isDisabled"
              />
            </div>
          </div>
          <!-- Phone Number -->
          <div class="input-group">
            <div class="input-field col-md-6 pl-0">
              <label for="settings_phone_number">Phone Number</label>
              <input
                id="settings_phone_number"
                ref="settings_phone_number"
                v-model="user.phone"
                type="text"
                class="form-control"
                :disabled="isDisabled"
              />
            </div>
            <!-- signature -->
            <div class="input-field col-md-6 pr-0">
              <label for="settings_user_currency">Signature</label>
              <!-- signature selector: changes id for css styling depending on the value of the selected option -->
              <select
                :id="signatureStyle"
                class="form-control signature_option"
                :disabled="isDisabled"
                @change="selectSigStyle"
              >
                <optgroup id="cursive_1" class="signature_option">
                  <option value="cursive_1" @click="selectSigStyle">
                    Yellowtail ({{ user.signature }})
                  </option>
                </optgroup>
                <optgroup id="cursive_2" class="signature_option">
                  <option value="cursive_2" @click="selectSigStyle">
                    Dancing Script ({{ user.signature }})
                  </option>
                </optgroup>
                <optgroup id="cursive_3" class="signature_option">
                  <option value="cursive_3" @click="selectSigStyle">
                    Satisfy ({{ user.signature }})
                  </option>
                </optgroup>
                <optgroup id="cursive_4" class="signature_option">
                  <option value="cursive_4" @click="selectSigStyle">
                    Cookie ({{ user.signature }})
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <div class="input-group">
            <!-- account type -->
            <div class="form-check form-check-inline col-md-6 pl-0">
              <input
                v-model="userProfileType"
                class="form-check-input"
                type="radio"
                value="personal"
                :disabled="isDisabled"
                @change="selectUserProfileType($event)"
              />
              <label class="form-check-label" for="inlineRadio1"
                >I'm an Individual</label
              >
            </div>
            <!-- radio and drop down for selecting company type -->
            <div class="form-check form-check-inline col-md-5 pr-0">
              <input
                v-model="userProfileType"
                class="form-check-input"
                type="radio"
                value="company"
                :disabled="isDisabled"
                @change="selectUserProfileType($event)"
              />
              <label
                v-show="showCompanyLabel"
                class="form-check-label"
                for="inlineRadio1"
                >I'm a Company</label
              >
              <select
                v-show="showCompanyType"
                ref="companyTypeInput"
                v-model="companyTypeIndex"
                class="form-control form-check-label"
                :disabled="isDisabled"
                @change="selectCompanyIndex($event)"
              >
                <!-- <option value="select" selected>Choose Company Type</option> -->
                <option
                  v-for="(value, name) in companyType"
                  :key="name"
                  :value="value"
                  :disabled="value === 0 ? true : false"
                >
                  {{ name }}
                </option>
              </select>
            </div>
          </div>
          <!-- form actions -->
          <div class="flex items-center mt-4 mb-6">
            <!-- submit or action button -->
            <button
              v-ripple="'rgba(255, 255, 255, .2)'"
              type="submit"
              class="btn bg-gray-400 text-black w-24 justify-center"
              @click="editProfile"
            >
              Edit
            </button>
            <button
              v-ripple="'rgba(255, 255, 255, .2)'"
              type="submit"
              class="btn bg-blue-700 text-white w-24 justify-center"
              :disabled="isDisabled"
              @click="updateProfile"
            >
              Save
            </button>
          </div>
        </div>
        <!-- form actions -->
      </div>
    </div>
  </form>
</template>
<script>
import { mapActions, mapState } from 'vuex'
import csc from 'country-state-city'
import cityTimezones from 'city-timezones'
import moment from 'moment'
import 'moment-timezone'
import cc from 'currency-codes'
import currencyConfig from '../../config/currencyConfig'
import getSymbolFromCurrency from 'currency-symbol-map'
import { getCountry } from 'country-currency-map'

export default {
  name: 'UserProfile',
  data: () => ({
    isDisabled: true,
    countries: '',
    states: '',
    socialIdIsHidden: true,
    isPrintMode: false,
    socialIdentity: '',
    showCompanyLabel: true,
    showCompanyType: false,
    w9Password: '',
    companyTypeIndex: 0,
    companyTypeInput: '',
    userProfileType: '',
    notificationsEnabled: true,
    appToTrayEnabled: false,
    bugTrackingEnabled: false,
    companyType: {
      '(Select Company Type)': 0,
      "I'm a C Corporation (INC)": 1,
      "I'm a S Corporation (INC)": 2,
      "I'm a Partnership (INC)": 3,
      "I'm a Trust/Estate (INC)": 4,
      "I'm a Partnership (LLC)": 5
    },
    signatureStyle: 'cursive_1',
    fiatCurrencyList: [],
    cryptocurrencyList: currencyConfig.coinsList,
    globalCurrencyIsFiat: true
  }),
  computed: {
    ...mapState(['contacts']),
    user() {
      // Since Signup/Login is currently disabled, a default user object will be used to render this page.
      return {}
      // const activeUser = this.$store.state.accounts.active
      // return JSON.parse(JSON.stringify(activeUser))
    },
    globalCurrencyType() {
      return this.globalCurrencyIsFiat ? 'Fiat' : 'Cryptocurrency'
    },
    globalCurrencyList() {
      return this.globalCurrencyIsFiat
        ? this.fiatCurrencyList
        : this.cryptocurrencyList
    }
  },
  methods: {
    ...mapActions({
      updateUser: 'accounts/updateUser',
      fetchCoinsInfo: 'fetchCoinsInfo'
    }),
    getSymbolFromCurrency,
    updateProfile() {
      const { $toast } = this

      $toast.question(
        'Are you sure you want to save these changes?',
        'Caution!',
        {
          timeout: 20000,
          close: false,
          overlay: true,
          displayMode: 'once',
          id: 'question',
          zindex: 999,
          position: 'center',
          buttons: [
            [
              '<button><b>YES</b></button>',
              async (instance, toast) => {
                // Update User profile on click of YES
                this.updateUser(this.user)

                // Disables input fields after updating profile
                this.isDisabled = true
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button')
                $toast.success('Profile updated successfully!', '', {
                  position: 'center',
                  timeout: 1000
                })
                // if (callback) callback()
              },
              true
            ],
            [
              '<button>NO</button>',
              function (instance, toast) {
                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button')
              }
            ]
          ]
        }
      )
    },
    editProfile() {
      this.isDisabled = false
    },
    getStateByCountryId(event) {
      // get country id
      const countryId = event.target.value
      // get country name
      const countryName = event.target.options[event.target.selectedIndex].text
      // load country states by Country ID
      this.states = csc.getStatesOfCountry(countryId)
      // load country currency by Country Name
      const countryCurrency = getCountry(countryName)
      // set country's currency
      this.user.currency = countryCurrency.currency
    },
    selectGlobalCurrency(event) {
      // sets the user's global currency
      this.user.globalCurrency = event.target.value
    },
    loadStateByCountryId() {
      // load states by the saved country ID on mounted
      this.states = csc.getStatesOfCountry(this.user.country)
    },
    getTimeZone() {
      const current = moment(new Date().toISOString())
      // get iso2 code for country
      const iso2 = csc.getCountryById(this.user.country).sortname
      // get state name
      const cityName = this.user.city
      // get time zone by state name
      const timezonesWithCityName = cityTimezones.lookupViaCity(cityName)
      // Set time zone
      if (timezonesWithCityName.length > 0) {
        // if multiple results, filters by country
        this.user.timezone = current
          .tz(
            timezonesWithCityName.filter((item) => item.iso2 === iso2)[0]
              .timezone
          )
          .format('ha z')
      }
    },
    selectSigStyle: function (event) {
      // sets the signature style
      this.user.signatureStyle = event.target.value
      this.signatureStyle = this.user.signatureStyle
    },
    selectUserProfileType: function (event) {
      this.user.userProfileType = event.target.value
      this.userProfileType = this.user.userProfileType
    },
    selectCompanyIndex: function (event) {
      this.user.companyTypeIndex = parseInt(event.target.value)
      this.companyTypeIndex = this.user.companyTypeIndex
    },
    isGlobalCurrencyFiat() {
      const globalCurrency = this.user.globalCurrency
      const isFiat = this.fiatCurrencyList.includes(globalCurrency)
      return isFiat
    }
  },
  watch: {
    // removing any watch functionality for Company drop down or companyTypeInput
    userProfileType(val) {
      if (val === 'company') {
        this.companyTypeInput = '1'
        this.showCompanyLabel = false
        this.showCompanyType = true
      } else if (val === 'personal') {
        this.showCompanyLabel = true
        this.showCompanyType = false
      }
    },
    companyTypeIndex() {
      if (this.companyTypeIndex === null) {
        this.companyTypeIndex = 0
      }
    }
  },
  async mounted() {
    this.countries = csc.getAllCountries()
    this.loadStateByCountryId()
    // sets signature style
    this.signatureStyle = this.user.signatureStyle
    // sets currency list
    this.fiatCurrencyList = cc.codes()
    // set radio button for usrProfileType and company type
    this.userProfileType = this.user.userProfileType
    this.companyTypeIndex = this.user.companyTypeIndex
    // // see if companyTypeInput is needed or needs to be set here
    this.companyTypeInput = this.user.companyTypeInput
    // Determine type of global currency user has set
    this.globalCurrencyIsFiat = this.isGlobalCurrencyFiat()
  }
}
</script>

<style lang="scss" scoped>
.signature_option {
  font-size: 1.28rem;
}

.mailing_list_value {
  margin: 5px;
  padding: 2px;
}

.tooltip-custom {
  background-color: rgb(147, 156, 58);
  font-weight: bold;
  color: white;
  border-radius: 50%;
  width: 25px;
  height: 25px;
}
</style>
