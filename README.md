# 2d Boids

This is a simple implementation of the boids algorithm in 2d. The boids algorithm is a simple algorithm that simulates the flocking behavior of birds. The algorithm was created by Craig Reynolds in 1986. The algorithm is based on three simple rules:

1. **Separation**: Boids try to keep a minimum distance between each other.
2. **Alignment**: Boids try to match the velocity of their neighbors.
3. **Cohesion**: Boids try to move towards the center of mass of their neighbors.

## Parameters

There are a few parameters in my implementation that can be adjusted to change the behavior of the boids and the style of the simulation:

- **boidCount**: Specifies the total number of boids in the simulation.
- **numBoidColors**: Determines the number of colors used to draw the boids.
- **bounds** (width, height, margins, scale): Defines the size of the simulation area and how it is scaled.
- **ranges** (separation, visible): Determines the distances at which boids maintain separation and can see each other.
- **factors** (separation, alignment, cohesion, drag, mouse, turn): Controls the relative strength of each steering behavior including separation, alignment, cohesion, drag, mouse interaction, and turning force.
- **caps** (maxSpeed, minSpeed, maxAcceleration, minAcceleration): Sets the upper and lower limits for the boids’ speed and acceleration.
- **viewAngle**: Determines how wide a boid’s field of vision is measured in degrees.
- **trailLength**: Specifies how far back each boid’s movement trail extends in # of frames.
- **mouse**: Indicates how the boids respond to mouse input (e.g., avoid, attract, or none).
- **followColor**: Determines whether the boids follow their given color and try to stay with those with that color
- **show** (separationRange, visibleRange): Toggles the display of circles that depict each boid’s personal space and visibility range.
- **colors** (background, boids, protected, visible): Assigns the colors used for the simulation’s background, the boids, the protected zone, and visible zone.

## Interesting Presets

There are a few cool configurations already given:

1. Normal boid behavior
2. Normal behavior but faster
3. Like a school of fish. Equalibrium is an approximate cycle around the window
4. Bounds are set to the max of the height and width. Creates a spiral
5. Bounds are set to the min of the height and width: Creates a spiral
6. Two different colored boids. Seperates themselves out to a certain extent.

# todo

- [ ] create graphs for average speed and average number of other boids seen
- [ ] cool versions of boids that i found
- [ ] create a way to follow a line the user draws (add objects to avoid)
- [ ] variants of boids
- [ ] mobile version
- [ ] parallel computing?
