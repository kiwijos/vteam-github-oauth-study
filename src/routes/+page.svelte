<script lang="ts">
	import { PUBLIC_GITHUB_ID } from '$env/static/public';
	import { page } from '$app/stores';
</script>

{#if $page.data.user}
	<p>Signed in as {$page.data.user.name}</p>
	<form action="/logout" method="POST">
		<button type="submit">Log out</button>
	</form>
{:else}
	<p>
		Sign in using <a
			href="https://github.com/login/oauth/authorize?scope=user:email&client_id={PUBLIC_GITHUB_ID}"
			>GitHub</a
		>
	</p>
{/if}
