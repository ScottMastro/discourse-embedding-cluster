import Controller from "@ember/controller";
import loadScript from "discourse/lib/load-script";
import { tracked } from "@glimmer/tracking";
import { next } from '@ember/runloop';
import { scheduleOnce } from '@ember/runloop';
import { ajax } from 'discourse/lib/ajax';

export default class EmbeddingClusterController extends Controller {
  @tracked clusterData = [];
  @tracked isLoading = false;
  @tracked error = null;
  @tracked runOnce = false;

  ensureD3() {
    return loadScript("/plugins/discourse-embedding-cluster/d32/d3.v7.min.js");
  }

  constructor() {
    super(...arguments);
    scheduleOnce('afterRender', this, this.initialize);
  }

  async initialize() {
    try {
      await this.ensureD3();
      this.setupVisualization();
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  }

  async ensureD3() {
    try {
      await loadScript("/assets/javascripts/lib/d3.v7.min.js");
      console.log("D3.js loaded successfully");
    } catch (error) {
      console.error("Failed to load D3.js:", error);
      throw error;
    }
  }

  setupVisualization() {
    if (this.isLoading || this.runOnce) {
      return;
    }

    this.runOnce = true;
    this.isLoading = true;
    this.error = null;

    ajax('/explore/data.json')
      .then((response) => {
        this.clusterData = response.data;
        next(this, this.renderChart); 
      })
      .catch((error) => {
        this.error = 'Failed to load cluster data';
        console.error('Error fetching cluster data:', error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

renderChart() {
  const chartElement = document.getElementById('chart');
  if (!chartElement) {
    console.error("Element with ID 'chart' not found.");
    return;
  }

  // Remove existing SVG to avoid duplicates
  chartElement.innerHTML = '';

  const svg = d3.select(chartElement)
    .append("svg")
    .attr("width", 600)
    .attr("height", 400)
    .style("border", "1px solid black"); // Optional: Add a border for visibility

  console.log("SVG element:", svg.node());
  console.log("Cluster Data:", this.clusterData);

  if (!this.clusterData || this.clusterData.length === 0) {
    console.error("No data to render");
    return;
  }

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(this.clusterData, d => d.x)])
    .range([0, 600]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(this.clusterData, d => d.y)])
    .range([400, 0]);

  const circles = svg.selectAll("circle")
    .data(this.clusterData)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.x))
    .attr("cy", d => yScale(d.y))
    .attr("r", 5)
    .attr("fill", "steelblue")
    .on("mouseover", function(event, d) {
      // Increase radius and change color on hover
      d3.select(this)
        .transition()
        .duration(100)
        .attr("r", 10)
        .attr("fill", "orange");

      // Optionally, you can display more information
      svg.append("text")
        .attr("x", xScale(d.x) + 10)
        .attr("y", yScale(d.y) - 10)
        .attr("id", "tooltip")
        .text(`x: ${d.x}, y: ${d.y}`);
    })
    .on("mouseout", function(event, d) {
      // Revert radius and color when mouse moves out
      d3.select(this)
        .transition()
        .duration(100)
        .attr("r", 5)
        .attr("fill", "steelblue");

      // Remove the tooltip
      svg.select("#tooltip").remove();
    });

  console.log("Circles added:", circles.nodes());
}
}