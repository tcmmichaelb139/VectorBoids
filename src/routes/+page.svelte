<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Pane,
		Folder,
		Slider,
		List,
		Checkbox,
		Color,
		ButtonGrid,
		Textarea,
		FpsGraph,
		type ButtonGridClickEvent
	} from 'svelte-tweakpane-ui';
	import { queryParameters } from 'sveltekit-search-params';

	import { Boids, setOptions } from '$lib/boids';
	import { mouse, goptions } from '$lib/globals';
	import {
		getBoidSimOptions,
		numBoidSimOptions,
		getVectorFieldOptions,
		numVectorFieldOptions
	} from '$lib/boidoptions';

	let fpsMeter = $state(60);
	let validVectorField: boolean | undefined = $state(false);

	let showShare = $state(false);
	let showHelp = $state(false);

	let boids: Boids;

	const parems = queryParameters();

	$goptions.vectorField = getVectorFieldOptions(1);

	try {
		if ($parems.options) {
			const parsedOptions = JSON.parse($parems.options);
			for (const key in parsedOptions) {
				if (parsedOptions.hasOwnProperty(key) && $goptions.hasOwnProperty(key)) {
					$goptions[key] = parsedOptions[key];
				}
			}
		}
	} catch (e) {
		console.log(e);
	}

	$effect(() => {
		$parems.options = JSON.stringify($goptions);
		validVectorField = setOptions($goptions);
	});

	onMount(() => {
		const canvas = document.getElementById('boids') as HTMLCanvasElement;
		if (!canvas) return console.log('Canvas not found');

		boids = new Boids(canvas);
		boids.start();
	});
</script>

<svelte:head>
	<title>VectorBoids</title>
	<meta name="description" content="Explore boids and vector fields in real time." />
	<meta name="keywords" content="boids, vector fields, simulation, real time" />
	<meta name="author" content="Michael Bao" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#ffffff" />
	<meta name="robots" content="index, follow" />
	<meta name="googlebot" content="index, follow" />
	<meta name="bingbot" content="index, follow" />
	<meta property="og:title" content="VectorBoids" />
	<meta property="og:description" content="Explore boids and vector fields in real time." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://vectorboids.michaelbao.io" />
	<meta property="og:image" content="https://vectorboids.michaelbao.io/website.png" />
	<meta property="og:site_name" content="VectorBoids" />
	<meta property="og:locale" content="en_US" />
</svelte:head>

<div class="flex h-full w-full items-center justify-center">
	<canvas
		id="boids"
		class="h-full w-full border-gray"
		style="background-color: {$goptions.colors.background}"
		onmousemove={(e) => {
			const rect = (e.target as HTMLCanvasElement)?.getBoundingClientRect();
			mouse.x = (e.clientX - rect.left) * $goptions.bounds.scale;
			mouse.y = (e.clientY - rect.top) * $goptions.bounds.scale;
		}}
	></canvas>
	<Pane
		x={10}
		y={10}
		expanded={false}
		storePositionLocally={false}
		width={300}
		title="Boid Settings"
	>
		<Folder title="General" expanded={true}>
			<Slider bind:value={$goptions.boidCount} label="Boid Count" min={1} max={5000} step={1} />
			<Slider
				bind:value={$goptions.numBoidColors}
				label="# of Boid Colors"
				min={1}
				max={10}
				step={1}
			/>
		</Folder>
		<Folder title="Bounds" expanded={false}>
			<Slider bind:value={$goptions.bounds.margins} label="Margins" min={0} max={5000} step={1} />
			<Slider
				bind:value={$goptions.bounds.scale}
				label="Bounds Scale"
				min={0.5}
				max={2}
				step={0.01}
			/>
		</Folder>
		<Folder title="Ranges" expanded={false}>
			<Slider
				bind:value={$goptions.ranges.separation}
				label="Separation Range"
				min={0}
				max={5000}
				step={1}
			/>
			<Slider
				bind:value={$goptions.ranges.visible}
				label="Visible Range"
				min={0}
				max={5000}
				step={1}
			/>
		</Folder>
		<Folder title="Factors" expanded={false}>
			<Slider
				bind:value={$goptions.factors.separation}
				label="Separation Factor"
				min={0}
				max={5}
				step={0.01}
			/>
			<Slider
				bind:value={$goptions.factors.alignment}
				label="Alignment Factor"
				min={0}
				max={5}
				step={0.01}
			/>
			<Slider
				bind:value={$goptions.factors.cohesion}
				label="Cohesion Factor"
				min={0}
				max={1}
				step={0.01}
			/>
			<Slider bind:value={$goptions.factors.drag} label="Drag Factor" min={0} max={1} step={0.01} />
			<Slider bind:value={$goptions.factors.turn} label="Turn Factor" min={0} max={10} step={0.1} />
			<Slider
				bind:value={$goptions.factors.mouse}
				label="Mouse Factor"
				min={0}
				max={20}
				step={0.01}
			/>
		</Folder>
		<Folder title="Caps" expanded={false}>
			<Slider bind:value={$goptions.caps.maxSpeed} label="Max Speed" min={0} max={20} step={0.1} />
			<Slider bind:value={$goptions.caps.minSpeed} label="Min Speed" min={0} max={20} step={0.1} />
			<Slider
				bind:value={$goptions.caps.maxAcceleration}
				label="Max Acceleration"
				min={0}
				max={5}
				step={0.01}
			/>
			<Slider
				bind:value={$goptions.caps.minAcceleration}
				label="Min Acceleration"
				min={0}
				max={5}
				step={0.01}
			/>
		</Folder>
		<Folder title="Miscellaneous" expanded={false}>
			<Slider bind:value={$goptions.viewAngle} label="View Angle" min={0} max={360} step={1} />
			<List
				bind:value={$goptions.mouse}
				label="Mouse Function"
				options={{ None: 'none', Avoid: 'avoid', Attract: 'attract' }}
			/>
			<Checkbox bind:value={$goptions.followColor} label="Follow Color" />
		</Folder>
		<Folder title="Visuals" expanded={false}>
			<Slider bind:value={$goptions.trailLength} label="Trail Length" min={0} max={250} step={1} />
			<Folder title="Show" expanded={false}>
				<Checkbox bind:value={$goptions.show.separationRange} label="Separation Range" />
				<Checkbox bind:value={$goptions.show.visibleRange} label="Visible Range" />
				<Checkbox bind:value={$goptions.show.vectorField} label="Vector Field" />
			</Folder>
			<Color bind:value={$goptions.colors.background} label="Background Color" />
			<Folder title="Boid Colors" expanded={false}>
				{#each $goptions.colors.boids as _, i}
					<Color bind:value={$goptions.colors.boids[i]} label={`Boid Color ${i + 1}`} />
				{/each}
			</Folder>
			<Folder title="Range Colors" expanded={false}>
				<Color bind:value={$goptions.colors.separation} label="Separation Range Color" />
				<Color bind:value={$goptions.colors.visible} label="Visible Range Color" />
			</Folder>
			<Folder title="Vector Field " expanded={false}>
				<Color bind:value={$goptions.colors.vectorField} label="Vector Field Color" />
				<Slider
					bind:value={$goptions.vectorFieldGridWidth}
					label="Vector Field Grid Width"
					min={5}
					max={250}
					step={1}
				/>
			</Folder>
		</Folder>
		<Folder title="Presets" expanded={false}>
			<ButtonGrid
				on:click={(event: ButtonGridClickEvent) => {
					$goptions = getBoidSimOptions(parseInt(event.detail.label) - 1);
					boids.reset();
				}}
				buttons={Array.from({ length: numBoidSimOptions() }, (_, i) => (i + 1).toString())}
			/></Folder
		>
		<Folder title="Vector Field" expanded={false}>
			<Slider
				bind:value={$goptions.vectorField.factor}
				label="Vector Field Factor"
				min={0}
				max={10}
				step={0.000001}
			/>
			<Textarea bind:value={$goptions.vectorField.x} label="Vector Field X" />
			<Textarea bind:value={$goptions.vectorField.y} label="Vector Field Y" />
			<Folder title="Presets" expanded={false}>
				<ButtonGrid
					on:click={(event: ButtonGridClickEvent) => {
						$goptions.vectorField = getVectorFieldOptions(parseInt(event.detail.label) - 1);
					}}
					buttons={Array.from({ length: numVectorFieldOptions() }, (_, i) => (i + 1).toString())}
				/></Folder
			>
		</Folder>
		<FpsGraph
			max={fpsMeter}
			on:change={(e) => {
				fpsMeter = Math.max(fpsMeter, Math.round(e.detail + 50));
			}}
		/>
	</Pane>

	<div class="absolute bottom-2 right-2 flex border border-gray bg-bg p-1 text-gray">
		<div
			class="group flex h-8 w-8 flex-col items-center justify-center p-0.5 {validVectorField
				? 'text-green'
				: 'text-red'}"
		>
			<span
				class="absolute -top-9 text-nowrap border bg-bg p-1.5 text-xs opacity-0 transition-all group-hover:opacity-100"
				>{validVectorField ? 'Valid' : 'Invalid'} Vector Field</span
			>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M16.0503 12.0498L21 16.9996L16.0503 21.9493L14.636 20.5351L17.172 17.9988L4 17.9996V15.9996L17.172 15.9988L14.636 13.464L16.0503 12.0498ZM7.94975 2.0498L9.36396 3.46402L6.828 5.9988L20 5.99955V7.99955L6.828 7.9988L9.36396 10.5351L7.94975 11.9493L3 6.99955L7.94975 2.0498Z"
				></path></svg
			>
		</div>
		<button
			class="ml-0.5 h-8 w-8 p-0.5 transition-colors hover:text-purple"
			aria-label="Share"
			onclick={() => (showShare = !showShare)}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M13.1202 17.0228L8.92129 14.7324C8.19135 15.5125 7.15261 16 6 16C3.79086 16 2 14.2091 2 12C2 9.79086 3.79086 8 6 8C7.15255 8 8.19125 8.48746 8.92118 9.26746L13.1202 6.97713C13.0417 6.66441 13 6.33707 13 6C13 3.79086 14.7909 2 17 2C19.2091 2 21 3.79086 21 6C21 8.20914 19.2091 10 17 10C15.8474 10 14.8087 9.51251 14.0787 8.73246L9.87977 11.0228C9.9583 11.3355 10 11.6629 10 12C10 12.3371 9.95831 12.6644 9.87981 12.9771L14.0788 15.2675C14.8087 14.4875 15.8474 14 17 14C19.2091 14 21 15.7909 21 18C21 20.2091 19.2091 22 17 22C14.7909 22 13 20.2091 13 18C13 17.6629 13.0417 17.3355 13.1202 17.0228ZM6 14C7.10457 14 8 13.1046 8 12C8 10.8954 7.10457 10 6 10C4.89543 10 4 10.8954 4 12C4 13.1046 4.89543 14 6 14ZM17 8C18.1046 8 19 7.10457 19 6C19 4.89543 18.1046 4 17 4C15.8954 4 15 4.89543 15 6C15 7.10457 15.8954 8 17 8ZM17 20C18.1046 20 19 19.1046 19 18C19 16.8954 18.1046 16 17 16C15.8954 16 15 16.8954 15 18C15 19.1046 15.8954 20 17 20Z"
				></path></svg
			>
		</button>
		<a
			class="mx-1 h-8 w-8 transition-colors hover:text-purple"
			href="https://github.com/tcmmichaelb139/2d-boids"
			target="_blank"
			rel="noopener noreferrer"
			aria-label="GitHub"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M12.001 2C6.47598 2 2.00098 6.475 2.00098 12C2.00098 16.425 4.86348 20.1625 8.83848 21.4875C9.33848 21.575 9.52598 21.275 9.52598 21.0125C9.52598 20.775 9.51348 19.9875 9.51348 19.15C7.00098 19.6125 6.35098 18.5375 6.15098 17.975C6.03848 17.6875 5.55098 16.8 5.12598 16.5625C4.77598 16.375 4.27598 15.9125 5.11348 15.9C5.90098 15.8875 6.46348 16.625 6.65098 16.925C7.55098 18.4375 8.98848 18.0125 9.56348 17.75C9.65098 17.1 9.91348 16.6625 10.201 16.4125C7.97598 16.1625 5.65098 15.3 5.65098 11.475C5.65098 10.3875 6.03848 9.4875 6.67598 8.7875C6.57598 8.5375 6.22598 7.5125 6.77598 6.1375C6.77598 6.1375 7.61348 5.875 9.52598 7.1625C10.326 6.9375 11.176 6.825 12.026 6.825C12.876 6.825 13.726 6.9375 14.526 7.1625C16.4385 5.8625 17.276 6.1375 17.276 6.1375C17.826 7.5125 17.476 8.5375 17.376 8.7875C18.0135 9.4875 18.401 10.375 18.401 11.475C18.401 15.3125 16.0635 16.1625 13.8385 16.4125C14.201 16.725 14.5135 17.325 14.5135 18.2625C14.5135 19.6 14.501 20.675 14.501 21.0125C14.501 21.275 14.6885 21.5875 15.1885 21.4875C19.259 20.1133 21.9999 16.2963 22.001 12C22.001 6.475 17.526 2 12.001 2Z"
				></path></svg
			>
		</a>
		<button
			class="h-8 w-8 transition-colors hover:text-purple"
			aria-label="Help"
			onclick={() => (showHelp = !showHelp)}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
				><path
					d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM13 13.3551V14H11V12.5C11 11.9477 11.4477 11.5 12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.2723 8.5 10.6656 9.01823 10.5288 9.70577L8.56731 9.31346C8.88637 7.70919 10.302 6.5 12 6.5C13.933 6.5 15.5 8.067 15.5 10C15.5 11.5855 14.4457 12.9248 13 13.3551Z"
				></path></svg
			>
		</button>
	</div>

	{#if showShare}
		<div class="absolute z-[9999] h-full w-full bg-bg/75">
			<button class="absolute h-full w-full" onclick={() => (showShare = false)} aria-label="Close"
			></button>
			<div
				class="absolute left-1/2 top-1/2 max-w-80 -translate-x-1/2 -translate-y-1/2 transform border border-gray bg-bg p-4"
			>
				<div class="flex items-center justify-between">
					<h1 class="text-purple">Share</h1>
					<button
						class="h-5 w-5 transition-colors hover:text-purple"
						onclick={() => (showShare = false)}
						aria-label="Close"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
							><path
								d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"
							></path></svg
						>
					</button>
				</div>
				<div class="flex min-w-0 flex-col">
					<input
						class="my-4 border border-gray/50 bg-bg p-1 text-xs text-fg outline-none transition-colors hover:border-gray"
						value={document.URL}
					/>
					<div class="text-wrap text-xs">You can also copy the link from the address bar.</div>
				</div>
			</div>
		</div>
	{/if}

	{#if showHelp}
		<div class="absolute z-[9999] h-full w-full bg-bg/75">
			<button class="absolute h-full w-full" onclick={() => (showHelp = false)} aria-label="Close"
			></button>
			<div
				class="absolute left-1/2 top-1/2 max-w-96 -translate-x-1/2 -translate-y-1/2 transform border border-gray bg-bg p-4"
			>
				<div class="flex items-center justify-between">
					<h1 class="text-purple">VectorBoids</h1>
					<button
						class="h-5 w-5 transition-colors hover:text-purple"
						onclick={() => (showHelp = false)}
						aria-label="Close"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
							><path
								d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"
							></path></svg
						>
					</button>
				</div>
				<div class="flex min-w-0 flex-col text-sm">
					<p class="my-1">
						This website allows the exploration of boids and vector fields in real time.
					</p>
					<p class="my-1">
						Boids is algorithm created by Craig Reynolds in 1986, and it consists of 3 simple rules:
					</p>
					<ul class="my-1 list-disc space-y-2 pl-5">
						<li class="">Separation: Boids try to keep a minimum distance between each other.</li>
						<li class="">Alignment: Boids try to match the velocity of their neighbors.</li>
						<li class="">
							Cohesion: Boids try to move towards the center of mass of their neighbors.
						</li>
					</ul>
					<p class="my-1">
						In addition, this website allows the use of a vector field to influence the boids.
					</p>
					<p>
						The full list of options in the settings pane can be seen <a
							class="text-purple"
							href="https://github.com/tcmmichaelb139/VectorBoids/blob/main/assets/options.png"
							target="_blank"
							rel="noopener noreferrer">here</a
						>.
					</p>
				</div>
			</div>
		</div>
	{/if}
</div>

<svelte:window onresize={() => boids.updateCanvas()} />
