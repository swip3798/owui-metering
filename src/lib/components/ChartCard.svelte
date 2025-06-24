<script lang="ts">
	import { Card, Chart } from 'flowbite-svelte';
	import type { ApexOptions } from 'apexcharts';
	const {
		series,
		categories,
		bigValue,
		explanation,
		color = '#1C64F2'
	}: {
		series: ApexAxisChartSeries;
		categories: string[];
		bigValue: string;
		explanation: string;
		color?: string;
	} = $props();
	const type: 'area' = 'area';
	const options: ApexOptions = {
		chart: {
			height: '400px',
			type,
			fontFamily: 'Inter, sans-serif',
			dropShadow: {
				enabled: false
			},
			toolbar: {
				show: false
			}
		},
		tooltip: {
			enabled: true,
			x: {
				show: false,
				formatter(val: number, _: any) {
					if (Number.isInteger(val)) {
						return val.toFixed(0);
					} else {
						return val.toFixed(3);
					}
				}
			},
			y: {
				formatter(val: number, _: any) {
					if (Number.isInteger(val)) {
						return val.toFixed(0);
					} else {
						return val.toFixed(3);
					}
				}
			}
		},
		fill: {
			type: 'gradient',
			gradient: {
				opacityFrom: 0.55,
				opacityTo: 0,
				shade: color,
				gradientToColors: [color]
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			width: 6
		},
		grid: {
			show: false,
			strokeDashArray: 4,
			padding: {
				left: 2,
				right: 2,
				top: 0
			}
		},
		series,
		xaxis: {
			categories,
			labels: {
				show: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: true
			},
			tooltip: {
				enabled: true,
				formatter(value: string, _opts: any) {
					return categories[parseInt(value) - 1];
				}
			}
		},
		yaxis: {
			show: false
		}
	};
</script>

<Card class="w-full max-w-full p-1">
	<div class="flex justify-between">
		<div>
			<h5 class="pb-2 text-3xl leading-none font-bold text-gray-900 dark:text-white">
				{bigValue}
			</h5>
			<p class="text-base font-normal text-gray-500 dark:text-gray-400">{explanation}</p>
		</div>
	</div>
	<Chart {options} />
</Card>
