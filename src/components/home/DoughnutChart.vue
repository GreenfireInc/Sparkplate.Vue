<script>
import { Doughnut, mixins } from 'vue-chartjs'

export default {
  name: 'DougnutChart',
  extends: Doughnut,
  mixins: [mixins.reactiveProp],
  props: ['chartData', 'options'],
  watch: {
    options(newVal) {
      if (newVal === null) {
        // trap for null
        // console.log('**** options is null')
      } else {
        const chart = this.$data._chart
        chart.update()
        this.addPlugin({
          id: 'myUpdateEventCatcher',
          beforeEvent(chart, args) {
            var event = args.type
            if (event === 'mousemove' || event === 'mouseout') {
              // process the event
              window.ipcRenderer.send('updateDonutCenter', 'total')
              // console.log('**** mousemove triggered! ********', chart)
            }
          }
        })
        this.renderChart(this.chartData, this.options)
      }
    }
  },
  mounted() {
    this.addPlugin({
      id: 'myEventCatcher',
      beforeEvent(chart, args) {
        var event = args.type
        // x++
        // console.log('******** event >>>>> ' + 'x>>' + x + ' - ' + event)
        if (event === 'mousemove' || event === 'mouseout') {
          // process the event
          window.ipcRenderer.send('updateDonutCenter', 'total')
        }
      }
    })
    this.renderChart(this.chartData, this.options)
  }
}
</script>
