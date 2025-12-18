<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import { Chart } from '@flowbite-svelte-plugins/chart';
	import type { ApexOptions } from 'apexcharts';

	const { series, title }: { series: number[]; title: string } = $props();

	const colors = [
		'#3366CC',
		'#2E8B57',
		'#CC5500',
		'#663399',
		'#B22222',
		'#DAA520',
		'#008080',
		'#8B008B',
		'#6B8E23',
		'#FF7F50'
	];
	const options: ApexOptions = {
		series,
		colors,
		chart: {
			height: 320,
			width: '100%',
			type: 'donut'
		},
		stroke: {
			colors: ['transparent']
		},
		plotOptions: {
			pie: {
				donut: {
					labels: {
						show: true,
						name: {
							show: true,
							fontFamily: 'Inter, sans-serif',
							offsetY: 20
						},
						total: {
							showAlways: true,
							show: true,
							label: 'Total Cost',
							fontFamily: 'Inter, sans-serif',
							formatter: function (w) {
								const sum = w.globals.seriesTotals.reduce((a: number, b: number) => {
									return a + b;
								}, 0);
								return `${(sum / 1000).toFixed(0)}k`;
							}
						},
						value: {
							show: true,
							fontFamily: 'Inter, sans-serif',
							offsetY: -20,
							formatter: function (value) {
								if (typeof value == 'number') {
									return (value / 1000).toFixed(0) + 'k';
								} else {
									return value + 'k';
								}
							}
						}
					},
					size: '80%'
				}
			}
		},
		grid: {
			padding: {
				top: -2
			}
		},
		labels: ['Direct', 'Sponsor', 'Affiliate', 'Email marketing'],
		dataLabels: {
			enabled: false
		},
		legend: {
			position: 'bottom',
			fontFamily: 'Inter, sans-serif'
		},
		yaxis: {
			labels: {
				formatter: function (value) {
					return value + 'k';
				}
			}
		},
		xaxis: {
			labels: {
				formatter: function (value) {
					return value + 'k';
				}
			},
			axisTicks: {
				show: false
			},
			axisBorder: {
				show: false
			}
		}
	};
</script>

<Card class="p-4 md:p-6">
	<div class="flex w-full items-start justify-between">
		<div class="flex-col items-center">
			<div class="mb-1 flex items-center">
				<h5 class="me-1 text-xl leading-none font-bold text-gray-900 dark:text-white">
					{title}
				</h5>
			</div>
		</div>
	</div>

	<Chart {options} class="py-6" />
</Card>
