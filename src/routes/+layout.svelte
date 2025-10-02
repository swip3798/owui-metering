<script lang="ts">
	import {
		Button,
		DarkMode,
		Footer,
		FooterCopyright,
		Navbar,
		NavBrand,
		NavHamburger,
		NavLi,
		NavUl
	} from 'flowbite-svelte';
	import '../app.css';
	import { ArrowLeftToBracketOutline, GithubSolid } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

	let { children } = $props();
	const onLogout = () => {
		document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
		goto('/login');
	};
</script>

<svelte:head>
	<title>OWUI-Metering</title>
</svelte:head>
<Navbar class="flex bg-slate-300 dark:bg-slate-700">
	<NavBrand href="/">
		<img src="/icon.svg" class="me-3 h-6 sm:h-9" alt="Logo" />
		<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white"
			>OWUI Metering</span
		>
	</NavBrand>
	<NavHamburger />
	<NavUl>
		<NavLi href="/models">Models</NavLi>
		<NavLi href="/metering/activity">Activity</NavLi>
		<NavLi href="/metering/report">Cost Report</NavLi>
		<NavLi href="/admin">Administration</NavLi>
	</NavUl>
	<div class="flex flex-row gap-2">
		<DarkMode class="text-primary-500 dark:text-primary-600 border dark:border-gray-800" />
		<Button color="alternative" class="p-2.5" onclick={onLogout}
			><ArrowLeftToBracketOutline /></Button
		>
	</div>
</Navbar>
<header class="mb-8 flex justify-center gap-2"></header>
<main class="mx-auto flex w-full grow flex-col items-center sm:w-xl lg:w-4xl xl:w-7xl">
	{@render children()}
</main>
<Footer class="m-2 bg-slate-300 !py-4 dark:bg-slate-700">
	<FooterCopyright
		copyrightMessage="AGPL-v3"
		href="https://github.com/swip3798/owui-metering"
		by="OWUI Metering"
		year={2025}
	/>
	<a
		href="https://github.com/swip3798/owui-metering"
		class="dark:text-white"
		target="_blank"
		referrerpolicy="no-referrer"><GithubSolid /></a
	>
</Footer>
