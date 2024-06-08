// assets/javascripts/discourse/components/d3-scatterplot.js

import Component from '@ember/component';
import { scheduleOnce } from '@ember/runloop';
import { ajax } from 'discourse/lib/ajax';

export default Component.extend({
  didInsertElement() {
    this._super(...arguments);
    this.loadScatterplotData();
  },

  loadScatterplotData() {
    ajax('/d3-scatterplot').then((response) => {
      this.renderScatterplot(response.data);
    });
  },

  renderScatterplot(data) {
    // Your D3 rendering logic here
    const svg = d3.select(this.element).append('svg')
      .attr('width', 500)
      .attr('height', 500);

    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 5);
  }
});
