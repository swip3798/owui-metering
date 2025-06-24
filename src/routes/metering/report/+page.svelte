<script lang="ts">
	import {
		Alert,
		Button,
		Card,
		Heading,
		Listgroup,
		ListgroupItem,
		P,
		Select
	} from 'flowbite-svelte';
	import { FilePdfOutline } from 'flowbite-svelte-icons';
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import ChartCard from '$lib/components/ChartCard.svelte';
	import { goto } from '$app/navigation';
	import fileSaver from 'file-saver';

	const { data }: PageProps = $props();
	const yearOptions: { value: number; name: string }[] = $state([]);
	const monthOptions: { value: number; name: string }[] = $state([]);
	onMount(() => {
		for (
			let i = data.boundaries.first.getUTCFullYear();
			i <= data.boundaries.last.getUTCFullYear();
			i++
		) {
			yearOptions.push({ value: i, name: String(i) });
		}
		for (let i = 0; i <= 11; i++) {
			monthOptions.push({ value: i, name: String(i + 1) });
		}
	});
	let year = $state(data.year);
	let month = $state(data.month);
	const reloadReport = async () => {
		await goto(`/metering/report?year=${year}&month=${month}`);
	};

	$effect(() => {
		reloadReport();
	});

	const categories = $derived(data.dailyUsage.map((usage) => usage.date));
	const costSeries = $derived([
		{
			name: 'Cost',
			data: data.dailyUsage.map((usage) => usage.cost),
			color: '#1A56DB'
		}
	]);
	const inputSeries = $derived([
		{
			name: 'Input Token',
			data: data.dailyUsage.map((usage) => usage.input_token),
			color: '#15db00'
		}
	]);
	const outputSeries = $derived([
		{
			name: 'Output Token',
			data: data.dailyUsage.map((usage) => usage.output_token),
			color: '#b2078d'
		}
	]);
	const totalCost = $derived(
		data.dailyUsage.reduce((cost, usage) => {
			return cost + usage.cost;
		}, 0)
	);
	const totalInput = $derived(
		data.dailyUsage.reduce((input, usage) => {
			return input + usage.input_token;
		}, 0)
	);
	const totalOutput = $derived(
		data.dailyUsage.reduce((output, usage) => {
			return output + usage.output_token;
		}, 0)
	);

	const onPdfGenerate = async (userId: string | null) => {
		if (userId === null) {
			return;
		}
		const pdfRes = await fetch('/api/v1/user/report', {
			method: 'post',
			body: JSON.stringify({
				userId,
				year,
				month
			})
		});
		const pdfData = await pdfRes.bytes();
		const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
		fileSaver.saveAs(pdfBlob, `user-report-${year}-${month}-${userId.replaceAll('-', '')}.pdf`);
	};
</script>

<svelte:head>
	<title>Activity - OWUI-Metering</title>
</svelte:head>
<div class="flex w-full flex-col gap-2">
	<Heading tag="h1" class="mb-4">Metering Report</Heading>
	<Alert color="blue">
		<span class="font-medium">Important!</span>
		Cost calculation is done on IEEE Floating Point numbers and is not perfectly precise!
	</Alert>
	<Card class="flex w-full max-w-full flex-row items-center gap-2 p-2">
		<P>Select report month:</P>
		<Select bind:value={year} items={yearOptions}></Select>
		<Select bind:value={month} items={monthOptions}></Select>
	</Card>
	{#key data}
		<div class="flex flex-row gap-2">
			<ChartCard
				series={costSeries}
				{categories}
				bigValue={totalCost.toFixed(3) + '$'}
				explanation="Cost this month"
			/>
			<ChartCard
				series={inputSeries}
				{categories}
				bigValue={String(totalInput)}
				explanation="Input tokens this month"
				color="#00db57"
			/>
			<ChartCard
				series={outputSeries}
				{categories}
				bigValue={String(totalOutput)}
				explanation="Output tokens this month"
				color="#8107b2"
			/>
		</div>
		<Listgroup class="w-full">
			<Heading tag="h3" class="p-4">Users</Heading>
			{#each data.reportData as reportData}
				<ListgroupItem class="flex flex-row justify-between gap-2">
					<a class="text-xl text-white" href="/metering/user/{reportData?.user?.id}"
						>{reportData?.user?.name}</a
					>
					<div class="flex flex-row gap-2">
						<P class="text-xl"
							>Total cost generated: <em>{parseFloat(reportData.totalCost ?? 'NaN').toFixed(7)}$</em
							></P
						>
						<Button
							class="cursor-pointer"
							onclick={() => {
								onPdfGenerate(reportData?.user?.id ?? null);
							}}><FilePdfOutline /></Button
						>
					</div>
				</ListgroupItem>
			{/each}
		</Listgroup>
	{/key}
</div>
