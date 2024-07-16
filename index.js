import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const padding = 60;
const WIDTH = 1200;
const HEIGHT = 500;
const AXIS_Y_OFFSET = 10;
const TOOLTIP_PADDING = 20;
const commonCircleClass = "dot hover:fill-sky-400 cursor-pointer transition-all duration-300 ease-in-out opacity-80 hover:opacity-100";
const URL_DATA = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

fetch(URL_DATA)
   .then(response => {
      if (!response.ok) {
         throw new Error("Network response was not ok");
      }
      return response.json();
   })
   .then(data => {
      console.log(data);
      const time = data.map(d => d["Time"]);
      time.forEach((d, i) => {
         const [min, sec] = d.split(":");
         time[i] = new Date(2024, 0, 0, 0, min, sec);
      });
      const minTime = d3.min(time);
      const maxTime = d3.max(time);

      const year = data.map(d => d["Year"]);
      const minYear = d3.min(year);
      const maxYear = d3.max(year);

      //convert Date String to int
      const xScale = d3.scaleLinear()
         .domain([minYear - 1, maxYear + 1])
         .range([0, WIDTH]);

      const yScale = d3.scaleLinear()
         .domain([maxTime, minTime])
         .range([HEIGHT, 0]);

      const dotXScale = d3.scaleLinear()
         .domain([minYear - 1, maxYear + 1])
         .range([0, WIDTH]);
      const dotYScale = d3.scaleLinear()
         .domain([maxTime, minTime])
         .range([0, HEIGHT]);
      const svg = d3.select("svg").attr("width", WIDTH + padding * 2).attr("height", HEIGHT + padding);

      const tooltip = d3.select("#tooltip")

      const axisX = svg.append("g")
         .call(d3.axisBottom(xScale).tickFormat(d3.format(".0f")))
         .attr("id", "x-axis")
         .attr("transform", `translate(${padding},${HEIGHT + AXIS_Y_OFFSET})`);

      const axisY = svg.append("g")
         .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S")))
         .attr("id", "y-axis")
         .attr("transform", `translate(${padding},${AXIS_Y_OFFSET})`);


      const circles = svg.selectAll("circle")
         .data(data)
         .enter()
         .append("circle")
         .attr("cx", (_, i) => dotXScale(year[i]) + padding)
         .attr("cy", (_, i) => HEIGHT - dotYScale(time[i]) + AXIS_Y_OFFSET)
         .attr("r", 10)
         .attr("class", d => d.Doping != ""
            ? commonCircleClass + " fill-red-400"
            : commonCircleClass + " fill-green-400"
         )
         .attr("stroke", "black") // Color of the border
         .attr("stroke-width", 1) // Thickness of the border
         .attr("data-xvalue", d => d["Year"])
         .attr("data-yvalue", (_, i) => time[i])
         .on("mouseover", (e, d) => {
            d3.select(this).classed("hover", true);
            tooltip.style("opacity", 1)
               .attr("data-year", d["Year"])
               .html(`
                  ${d.Name}: ${d.Nationality} <br>
                  ${d.Year}, Time: ${d.Time} <br>
                  ${d.Doping!= "" ? d.Doping : ""}
               `) 
               
         })
         .on("mouseleave", () => {
            d3.select(this).classed("hover", false);
            tooltip.style("opacity", 0)
                  .style("left", "-9999px");

         })
         .on("mousemove", (e, d) => {
            tooltip.style("left", e.clientX + TOOLTIP_PADDING + "px")
               .style("top", e.clientY + TOOLTIP_PADDING + "px")
         })

      const legend = svg.append("g").attr("id", "legend");
      const Doping = legend.append("g").attr("id", "doping");
      Doping.attr("transform", `translate(${WIDTH - 200}, 50)`);
      Doping.append("text")
         .text("Doping allegations")
         .attr("transform", `translate(30, 15)`);
      Doping.append("rect")
         .attr("width", 20).attr("height", 20)
         .attr("class", "fill-red-400");
      const NoDoping = legend.append("g").attr("id", "no-doping");
      NoDoping.attr("transform", `translate(${WIDTH - 200}, 100)`);
      NoDoping.append("text")
         .text("No doping allegations")
         .attr("transform", `translate(30, 15)`);
      NoDoping.append("rect").attr("width", 20)
         .attr("height", 20)
         .attr("class", "fill-green-400")

   })
   .catch(error => console.error(error));
