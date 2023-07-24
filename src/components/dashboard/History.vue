<template>
  <div id="data-table" ref="content">
    <div class="container-fluid">
      <!-- removing row class as it is used in expand row css it is also making the transaction table wider when removed -->
      <!-- <div class="row" v-if="!printMode"> -->
      <div v-if="!printMode">
        <div class="parent">
          <div class="child" style="width: 50%">
            <select v-model="selectedWallet" class="form-control">
              <option value="">Select a Wallet</option>
              <option
                v-for="(wallet, walletIndex) in wallets"
                :key="walletIndex"
                :value="wallet"
              >
                {{ wallet.address }} (Bal: {{ wallet.balance }}
                {{ wallet.currency }})
              </option>
            </select>
          </div>

          <div
            v-if="data.length > 0"
            class="child"
            style="text-align: right; vertical-align: top"
          >
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-secondary dropdown-toggle"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                style="max-height: 40px"
                @click="showExportOptions = !showExportOptions"
              >
                Export As
              </button>
              <div
                class="dropdown-menu"
                :style="
                  'display:' + (showExportOptions ? 'block' : 'none') + ';'
                "
              >
                <a class="dropdown-item" href="#!" @click.prevent="exportToCsv"
                  >Export As CSV</a
                >
                <a class="dropdown-item" href="#!" @click.prevent="exportPDF"
                  >Export As PDF</a
                >
              </div>
            </div>
          </div>
        </div>

        <div v-if="data.length > 0" class="dash-history-scrollable-container">
          <table
            class="transaction-table table table-striped table-sm"
            style="width: 99%"
          >
            <!-- sticky-top is keeping thead on top when scrolling but the tr row below that has the data is scrolling up underneath the top columns
              have tried overflow hidden and z-index settings but does not work -->
            <thead class="sticky-top thead-dark" style="z-index: 999">
              <tr>
                <!-- NOTE not setting a class for number column as it does not center horizontally try setting custom class or find another way -->
                <th style="padding-left: 25px" scope="col">#</th>
                <th class="text-th" scope="col">Date</th>
                <th class="text-th" scope="col">Time</th>
                <th class="text-th" scope="col">Currency</th>
                <th class="text-th" scope="col">Src Addr</th>
                <th class="text-th" scope="col">TxID</th>
                <th class="text-th" scope="col">Dest Addr</th>
                <th class="text-th" scope="col">Amt</th>
                <th class="text-th" scope="col">Value</th>
                <th class="text-th" scope="col">Dr</th>
                <th class="text-th" scope="col">Cr</th>
                <th class="text-th" scope="col">rBalance Amt</th>
                <th class="text-th" scope="col">rBalance Val</th>
                <th class="text-th" scope="col">Label</th>
                <th class="text-th" scope="col">Notes</th>
              </tr>
            </thead>
            <div
              v-for="(transaction, index) in paginated"
              :key="index"
              class="history-row history-row-flow"
              :class="{ active: transaction.expanded }"
              @click="() => toggle(transaction)"
            >
              <tr class="row-text">
                <td class="text-center" scope="row">
                  {{ indexStart + ++index }}
                </td>
                <td scope="row">
                  {{ transaction.date.toLocaleDateString() }}
                </td>
                <td scope="row">
                  {{ transaction.date.toLocaleTimeString() }}
                </td>
                <td scope="row">
                  <CurrencySymbol :symbol="transaction.coinTicker" force-icon />
                  {{ transaction.currencyType }} ({{
                    transaction.coinTicker.toUpperCase()
                  }})
                </td>
                <!-- NOTE: prefixing with coinTicker value but this assumes all transactions are on the same coinTicker or platform if we support swaps then this will need to be updated -->
                <td scope="row">
                  {{ transaction.coinTicker }}://{{
                    createMiddleEllipse(transaction.source, 5, 5)
                  }}
                </td>
                <td scope="row">
                  <a class="" :href="transaction.explorerURL" target="_blank">{{
                    createMiddleEllipse(transaction.transactionId, 8, 8)
                  }}</a>
                </td>
                <td scope="row">
                  {{ transaction.coinTicker }}://{{
                    createMiddleEllipse(transaction.destination, 5, 5)
                  }}
                </td>
                <td scope="row">
                  {{ transaction.amount }}
                </td>
                <td scope="row">
                  <CurrencySymbol :symbol="getGlobalCurrency" />
                  {{ findCurrencyConversionMethod(transaction) }}
                </td>
                <td scope="row">
                  {{ checkActivityCategory(transaction, 'debit') }}
                </td>
                <td scope="row">
                  {{ checkActivityCategory(transaction, 'credit') }}
                </td>
                <!-- removing toFixed call as it is rounding value up and difficult to tell changes -->
                <td scope="row">
                  {{ transaction.runningBalance }}
                </td>
                <!-- <td scope="row">{{ transaction.runningBalance.toFixed(4) }}</td> -->
                <td scope="row">
                  <CurrencySymbol :symbol="getGlobalCurrency" />{{
                    getRunningBalanceValue(transaction)
                  }}
                </td>
                <td scope="row">
                  <div class="transaction-label-wrapper">
                    <select
                      v-model="transaction.txClassType"
                      class="select-label-box"
                      @change="setClassType($event, transaction)"
                    >
                      <!-- <option value="" selected>Label</option> -->
                      <!-- see if a change call can be done in the select to update Labels results are now paginated -->
                      <option
                        v-for="(classType, index) in classTypes"
                        :key="index"
                        :value="classType"
                      >
                        {{ classType }}
                      </option>
                    </select>
                  </div>
                </td>
                <td scope="row">
                  <button
                    v-ripple
                    class="btn bg-#F5F5F5"
                    @click.stop="initAddNote(transaction)"
                  >
                    <span class="glyphicon">&#x270f;</span>
                  </button>
                </td>
              </tr>
              <!-- NOTE: Adding Additional Row Details Here try just adding full Source and Desitnation Address and Notes -->
              <tr>
                <td colspan="14">
                  <div class="details details-style">
                    <table style="color: #616a6b; width: 99%">
                      <tr>
                        <th>|</th>
                        <th>Source Address:</th>
                        <th>|</th>
                        <th>Destination Address:</th>
                        <th>|</th>
                        <th>Note:</th>
                      </tr>
                      <tr>
                        <td colspan="2" class="td-details">
                          {{ transaction.coinTicker }}://{{
                            transaction.source
                          }}
                        </td>
                        <td colspan="2" class="td-details">
                          {{ transaction.coinTicker }}://{{
                            transaction.destination
                          }}
                        </td>
                        <td colspan="2" class="td-details">
                          {{ transaction.note }}
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
              </tr>
            </div>
          </table>
          <!-- end of Transaction table -->
          <!-- start pagination -->
          <div
            v-if="selectedWallet !== ''"
            ref="content"
            class="bg-white flex-grow shadow rounded-lg mt-4"
            style="width: 99%"
          >
            <nav aria-label="Page navigation">
              <ul class="pagination">
                <li class="page-item">
                  <a :class="displayPrevious()" href="#" @click="prev()"
                    >Previous</a
                  >
                </li>
                <li class="page-item">
                  <a class="page-link" href="#">{{ current }}</a>
                </li>
                <li class="page-item">
                  <a :class="displayNext()" href="#" @click="next()">Next</a>
                </li>
              </ul>
            </nav>
          </div>
          <!-- end pagination -->
        </div>
        <!-- end div data length greater then 0 -->
        <div v-else class="container pt-3 text-center">
          <h2 v-if="selectedWallet === ''">Kindly Select a Wallet</h2>
          <h2 v-else>No History found</h2>
        </div>
      </div>
      <!--  end printMode check -->
      <div @click.stop>
        <note-modal />
      </div>
    </div>
    <!-- end container fluid -->
  </div>
  <!-- end ref content data table parent container-->
</template>

<script>
import { mapState } from 'vuex'
import NoteModal from '@/components/history/NoteModal.vue'
// NOTE: the watch trigger is not passing data to Transactions component when switching between Wallet Addresses

let loader = null

export default {
  name: 'DashboardHistory',
  components: {
    NoteModal
  },
  props: ['selectedCrypto', 'wallets'],
  data() {
    return {
      data: [],
      selectedWallet: '',
      noteModalOpen: false,
      current: 1,
      pageSize: 10,
      showExportOptions: false,
      printMode: false,
      classTypes: [
        'Gift',
        'Transfer',
        'Purchase',
        'Sale',
        'Income',
        'Bill',
        'Swap'
      ]
    }
  },
  computed: {
    ...mapState({
      coinsInfo: 'coinsInfo'
    }),
    getGlobalCurrency() {
      const user = this.$store.state.accounts.active
      const userCurrency = user.globalCurrency
        ? user.globalCurrency
        : user.currency
      return userCurrency
    },
    indexStart() {
      return (this.current - 1) * this.pageSize
    },
    indexEnd() {
      return this.indexStart + this.pageSize
    },
    paginated() {
      return this.data.slice(this.indexStart, this.indexEnd)
    }
  },
  watch: {
    async selectedWallet(val) {
      // console.log('** dashboard History.vue selectedWallet watch val>>', val)
      if (val !== '') {
        loader = this.$loader(this.$refs.content)
        const activeUser = this.$store.state.accounts.active
        // make sure coinTicker is lowercase in Jsstore transaction table
        const coinTicker = val.coinTicker.toLowerCase()
        const userId = activeUser.id
        const whereValues = {
          userId: userId,
          coinTicker: coinTicker,
          walletAddress: val.address
        }
        const transactions = await this.$store.dispatch(
          'fetchTransactionsByAddress',
          whereValues
        )
        // trying to reset current to 1 for correct pagination
        this.current = 1
        this.data = transactions
        // console.log('** ** dashboard History.vue watch selectedWallet this.data (transactions) >>', this.data)
        loader.hide()
      }
    },
    selectedCrypto() {
      // why is this setting a blank selectedWallet and when does it execute?
      // console.log('** selectedCrypto watch val >>', val)
      this.selectedWallet = ''
      this.data = []
    },
    noteModalOpen() {
      this.noteModalOpen
        ? this.$modal.show('note-modal')
        : this.$modal.hide('note-modal')
    }
  },
  destroyed() {
    if (loader) loader.hide()
    this.showExportOptions = false
  },
  methods: {
    createMiddleEllipse(str, start = 10, end = 10) {
      if (str.length > 35) {
        return (
          str.substr(0, start) +
          '...' +
          str.substr(str.length - end, str.length)
        )
      }
      return str
    },
    displayPrevious() {
      if (this.data.length > 0) {
        return this.current < 2 ? 'page-link-none' : 'page-link'
      }
    },
    displayNext() {
      if (this.data.length > 0) {
        // console.log('** ** dashboard History.vue displayPrevious current>>', this.current)
        const totalTransactions = this.data.length
        // console.log('** ** dashboard History.vue totalTransactions >>>', totalTransactions)
        const pages = totalTransactions / this.pageSize
        // console.log('** ** dashboard History.vue pages >>>', Math.ceil(pages))
        const pagesCeiling = Math.ceil(pages)
        return this.current < pagesCeiling ? 'page-link' : 'page-link-none'
      }
    },
    getRunningBalanceValue(transaction) {
      // console.log('** getRunningBalanceValue  transaction>>', transaction)
      // storing running balance as String in database so need to parseFloat
      // for now runningBalanceValue gets calculated here and is not getting saved to db
      const rbFloat = parseFloat(transaction.runningBalance)
      // console.log('** getRunningBalanceValue  rbFloat>>', rbFloat)
      if (rbFloat && transaction.coinTicker) {
        const runBalanceValue = this.currencyToGlobalValue(
          rbFloat,
          transaction.coinTicker
        )
        // toFixed is rounding up removing for now while testing
        // return runBalanceValue.toFixed(2)
        return runBalanceValue.toFixed(2)
      } else {
        // console.log('** JournalEntries getRunningBalanceValue>>', transaction.address)
        return null
      }
    },
    prev() {
      this.current--
    },
    next() {
      this.current++
    },
    showTxId(text) {
      // NOTE: see if this method can be removed
      this.$toast.success(text, '', {
        position: 'center',
        timeout: 5000
      })
    },
    exportToCsv() {
      this.$exportAsCSV(this.data, (dataUrl) => {
        const element = document.createElement('a')
        element.href = dataUrl
        element.download = `${
          this.selectedWallet.address
        }_${this.selectedCrypto.symbol.toLowerCase()}.csv`
        element.click()
      })
    },
    exportPDF() {
      this.printMode = true
      this.$nextTick(() => {
        const divContents = document.getElementById('data-table').innerHTML
        this.$exportAsPDF(
          `${
            this.selectedWallet.address
          }_${this.selectedCrypto.symbol.toLowerCase()}.pdf`,
          divContents,
          { type: '' },
          (err) => {
            if (err) this.$toast.error(err, 'Error')
            else this.printMode = false
          }
        )
      })
    },
    checkActivityCategory(transaction, type) {
      // console.log('** Dash History > checkActivityCategory activityCategory : ' + transaction.activityCategory + ' : type : ' + type)
      if (
        transaction.activityCategory === 'inbound-transaction' &&
        type === 'credit'
      ) {
        return transaction.amount
      } else if (
        transaction.activityCategory === 'outbound-transaction' &&
        type === 'debit'
      ) {
        const transactionDebit = '-' + transaction.amount
        return transactionDebit
      }
    },
    initAddNote(transaction) {
      // console.log('** History.vue initAddNote **')
      this.$modal.show('addNoteModal', { transaction })
    },
    toggle(entry) {
      // console.log('Entry clicked: ', entry)
      entry.expanded = !entry.expanded
      // row will not expand without forceUpdate look into refactor that does not need this
      this.$forceUpdate()
    },
    transactionModify(trans, value) {
      if (trans && value) {
        const modifiedTransaction = { ...trans, txClassType: value }
        // console.log('** History.vue transactionModify>> modifiedTransaction>>', modifiedTransaction)
        return modifiedTransaction
      }
    },
    setClassType(event, transaction) {
      const value = event.target.value
      this.showClassType = false
      const transactionWithType = this.transactionModify(transaction, value)
      // fixed db update call, using existing set transaction method that updates transactions.list properly
      // have to see how to update UI properly with multiple rows of data, maybe some kind of page reload
      // NOTE: need an updateClassTypeDashboardHistory call here instead of Journal
      this.$emit('updateClassTypeDashboardHistory', transactionWithType)
      // this.userSelectedClassType = ''
      // this.$nextTick(() => {
      //   this.userSelectedClassType = value
      // })
    },
    findCurrencyConversionMethod(transaction) {
      if (transaction.amount && transaction.coinTicker) {
        const convertedValue = this.currencyToGlobalValue(
          transaction.amount,
          transaction.coinTicker
        )
        return convertedValue.toFixed(2)
      } else {
        return null
      }
    }
  }
}
</script>
<style lang="scss" scoped>
/*
 * There is a class row and a scope row are these Bootstrap related
 * Testing class with history-row
 */
.history-row {
  .details {
    display: none;
  }
  &.active {
    .details {
      display: block;
    }
  }
}

/* There is already a scrollable main container that exists
 * need to remove and have only the transaction table scroll
 * commenting out for now the JournalEntries Transaction table has a similar scroll setup
 */
.dash-history-scrollable-container {
  @apply overflow-y-auto;
  max-height: 75vh;
}
</style>

<style scoped>
/*
 * Was testing to see if scrollbar can be removed did not work
 * removed any scss declarations from parent vue Dashboard
 */
/* #data-table {
  overflow: scroll;
  overflow-x: hidden;
} */

.details-style {
  margin: 10px 25px 10px 25px;
}

/*
 * Display table-row-group provides the inner table for expandable details
 * Table will break width without it could look into a new layout by using another layout
 * Setting z-index to see if it fixes layout issue where table data scrolls underneath th headers
 */
.history-row-flow {
  z-index: 99;
  overflow: hidden;
  display: table-row-group;
}

.parent {
  /* border: 1px solid black; */
  margin: 1rem;
  padding: 2rem 2rem;
  text-align: center;
}
.child {
  display: inline-block;
  /* border: 1px solid red; */
  padding: 1rem 1rem;
  vertical-align: middle;
}

.page-link-none {
  display: none;
}

#pagination-anchor {
  position: absolute;
  left: 50px;
  bottom: 10px;
  width: 10px;
  margin-right: 10px;
}
.text-center {
  vertical-align: auto;
}

.text-th {
  text-align: left;
}
.row-text {
  font-size: 0.9rem;
  text-align: left;
  /* overflow: hidden; */
  /* z-index: 1;*/
}

.row-details {
  background-color: #f5f5f5;
}

.td-details {
  padding: 0 7px 0 5px;
}

.transaction-label-wrapper {
  font-size: 0.9rem;
  border-radius: 20px;
  display: inline-block;
  overflow: hidden;
  /* background:#cccccc; */
  background: #b3b6b7;
  border: 1px solid #cccccc;
}
.select-label-box {
  width: 125px;
  height: 30px;
  border: 0px;
  outline: none;
  /* padding-left: 20px; */
  text-align: center;
}
</style>
