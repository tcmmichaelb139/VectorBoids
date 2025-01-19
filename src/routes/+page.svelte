<script lang="ts">
	import {
		Pane,
		Folder,
		Slider,
		List,
		Checkbox,
		Color,
		ButtonGrid,
		FpsGraph,
		type ButtonGridClickEvent
	} from 'svelte-tweakpane-ui';
	import { onMount } from 'svelte';

	import Boids from '$lib/boids';
	import { mouse } from '$lib/globals';
	import { getBoidSimOptions, numBoidSimOptions, updateBoidOptions } from '$lib/boidoptions';
	import type { BoidSimOptions } from '$lib/types';

	let fpsMeter = 60;

	let boids: Boids;

	let options: BoidSimOptions = {
		boidCount: 500,
		numBoidColors: 1,
		bounds: {
			width: 0,
			height: 0,
			margins: 50,
			scale: 1
		},
		ranges: {
			separation: 50,
			visible: 50
		},
		factors: {
			separation: 1.0,
			alignment: 0.75,
			cohesion: 0.75,
			drag: 0.25,
			mouse: 0.5,
			turn: 5
		},
		caps: {
			maxSpeed: 2.5,
			minSpeed: 2.5,
			maxAcceleration: 0.15,
			minAcceleration: 0.01
		},
		viewAngle: 360,
		mouse: 'none',
		followColor: true,
		trailLength: 10,
		show: {
			separationRange: false,
			visibleRange: false
		},
		colors: {
			background: '#1a1b26',
			boids: ['#bb9af7'],
			separation: '#f7768e',
			visible: '#9ece6a'
		}
	};

	onMount(() => {
		options = updateBoidOptions(options);

		const canvas = document.getElementById('boids') as HTMLCanvasElement;
		if (!canvas) return console.log('Canvas not found');

		boids = new Boids(canvas, options);
		boids.start();
	});
</script>

<div class="flex h-full items-center justify-center">
	<canvas
		id="boids"
		class="h-full w-full border-gray"
		style="background-color: {options.colors.background}"
		onmousemove={(e) => {
			const rect = (e.target as HTMLCanvasElement)?.getBoundingClientRect();
			mouse.x = (e.clientX - rect.left) * options.bounds.scale;
			mouse.y = (e.clientY - rect.top) * options.bounds.scale;
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
			<Slider bind:value={options.boidCount} label="Boid Count" min={1} max={5000} step={1} />
			<Slider
				bind:value={options.numBoidColors}
				label="# of Boid Colors"
				min={1}
				max={10}
				step={1}
			/>
		</Folder>
		<Folder title="Bounds" expanded={false}>
			<Slider
				bind:value={options.bounds.margins}
				label="Margins"
				min={0}
				max={Math.min(options.bounds.width, options.bounds.width) / 2}
				step={1}
			/>
			<Slider
				bind:value={options.bounds.scale}
				label="Bounds Scale"
				min={0.5}
				max={2}
				step={0.01}
			/>
		</Folder>
		<Folder title="Ranges" expanded={false}>
			<Slider
				bind:value={options.ranges.separation}
				label="Separation Range"
				min={0}
				max={Math.max(options.bounds.width, options.bounds.width)}
				step={1}
			/>
			<Slider
				bind:value={options.ranges.visible}
				label="Visible Range"
				min={0}
				max={Math.max(options.bounds.width, options.bounds.width)}
				step={1}
			/>
		</Folder>
		<Folder title="Factors" expanded={false}>
			<Slider
				bind:value={options.factors.separation}
				label="Separation Factor"
				min={0}
				max={5}
				step={0.01}
			/>
			<Slider
				bind:value={options.factors.alignment}
				label="Alignment Factor"
				min={0}
				max={5}
				step={0.01}
			/>
			<Slider
				bind:value={options.factors.cohesion}
				label="Cohesion Factor"
				min={0}
				max={1}
				step={0.01}
			/>
			<Slider bind:value={options.factors.drag} label="Drag Factor" min={0} max={1} step={0.01} />
			<Slider bind:value={options.factors.turn} label="Turn Factor" min={0} max={10} step={0.1} />
			<Slider bind:value={options.factors.mouse} label="Mouse Factor" min={0} max={5} step={0.01} />
		</Folder>
		<Folder title="Caps" expanded={false}>
			<Slider bind:value={options.caps.maxSpeed} label="Max Speed" min={0} max={20} step={0.1} />
			<Slider bind:value={options.caps.minSpeed} label="Min Speed" min={0} max={20} step={0.1} />
			<Slider
				bind:value={options.caps.maxAcceleration}
				label="Max Acceleration"
				min={0}
				max={5}
				step={0.01}
			/>
			<Slider
				bind:value={options.caps.minAcceleration}
				label="Min Acceleration"
				min={0}
				max={5}
				step={0.01}
			/>
		</Folder>
		<Folder title="Miscellaneous" expanded={false}>
			<Slider bind:value={options.viewAngle} label="View Angle" min={0} max={360} step={1} />
			<List
				bind:value={options.mouse}
				label="Mouse Function"
				options={{ None: 'none', Avoid: 'avoid', Attract: 'attract' }}
			/>
			<Checkbox bind:value={options.followColor} label="Follow Color" />
		</Folder>
		<Folder title="Visuals" expanded={false}>
			<Slider bind:value={options.trailLength} label="Trail Length" min={0} max={250} step={1} />
			<Folder title="Show" expanded={false}>
				<Checkbox bind:value={options.show.separationRange} label="Separation Range" />
				<Checkbox bind:value={options.show.visibleRange} label="Visible Range" />
			</Folder>
			<Color bind:value={options.colors.background} label="Background Color" />
			<Folder title="Boid Colors" expanded={false}>
				{#each options.colors.boids as color, i}
					<Color bind:value={options.colors.boids[i]} label={`Boid Color ${i + 1}`} />
				{/each}
			</Folder>
			<Folder title="Range Colors" expanded={false}>
				<Color bind:value={options.colors.separation} label="Separation Range Color" />
				<Color bind:value={options.colors.visible} label="Visible Range Color" />
			</Folder>
		</Folder>
		<Folder title="Presets">
			<ButtonGrid
				on:click={(event: ButtonGridClickEvent) => {
					options = getBoidSimOptions(parseInt(event.detail.label) - 1);
					boids.reset(options);
				}}
				buttons={Array.from({ length: numBoidSimOptions() }, (_, i) => (i + 1).toString())}
			/></Folder
		>
		<FpsGraph
			max={fpsMeter}
			on:change={(e) => {
				fpsMeter = Math.max(fpsMeter, Math.round(e.detail + 50));
			}}
		/>
	</Pane>

	<div class="absolute bottom-2 right-2 flex rounded-full border border-gray bg-bg text-gray">
		<a
			class="h-8 w-8 transition-colors hover:text-purple"
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
	</div>
</div>

<svelte:window onresize={() => boids.updateCanvas()} />
