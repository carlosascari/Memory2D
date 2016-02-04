console.log('memory2d-benchmark.js')
const SAMPLES_COUNT = 50000
const MIN_AXIS = -1000
const MAX_AXIS = 1000
const PRE_ALLOC_X = 0
const PRE_ALLOC_Y = 0

var mem = new Memory2D(PRE_ALLOC_X, PRE_ALLOC_Y)
var samples = []

function random_axis ()
{
	return ~~(MIN_AXIS + (Math.random() * (MAX_AXIS + Math.abs(MIN_AXIS) + 1)))
}

function random_data ()
{
	var r = ~~(Math.random() * 5)
	switch(r)
	{
		case 0:
		return {someint: random_axis(), someotherint: random_axis()}
		break;
		case 1:
		return [random_axis(), random_axis()]
		break;
		case 2:
		return random_axis() * random_axis()
		case 3:
		return random_axis() + 'as_a_string'
		break;
		case 4:
		return null
		break;
		default:
		return
	}
}

// populate samples
for (var i = 0; i < SAMPLES_COUNT; i++)
{
	var x = random_axis()
	var y = random_axis()
	var d = random_data()
	samples.push({x: x, y:y, d: d})
}

// Filter out dupes
var seen = {};
samples = samples.filter(function(item) {
	var sig = item.x + ',' + item.y
	return seen.hasOwnProperty(sig) ? false : (seen[sig] = true);
})


console.log('Benchmark ready. %d items', samples.length)
console.log('Coordinates will range between %d and %d', MIN_AXIS, MAX_AXIS)
if (PRE_ALLOC_X || PRE_ALLOC_X)
{
	console.log('Preallocated %d in x-axis and %d in y-axis', PRE_ALLOC_X, PRE_ALLOC_Y)
}
else
{
	console.log('No memory was preallocated.')
}


console.time('Memory2D.set')
for (var i = 0, l = samples.length; i < l; i++)
{
	var sample = samples[i]
	mem.set(sample.x, sample.y, sample.d)
}
console.timeEnd('Memory2D.set')

console.time('Memory2D.get')
for (var i = 0, l = samples.length; i < l; i++)
{
	var sample = samples[i]
	var result = mem.get(sample.x, sample.y)
	if (result !== sample.d)
	{
		throw new Error('wut?')
	}
}
console.timeEnd('Memory2D.get')

console.time('Memory2D.unset')
for (var i = 0, l = samples.length; i < l; i++)
{
	var sample = samples[i]
	var result = mem.unset(sample.x, sample.y)
	if (result !== sample.d)
	{
		throw new Error('wut?')
	}
}
console.timeEnd('Memory2D.unset')

// make sure all coordinates have been reset
for (var i = 0, l = samples.length; i < l; i++)
{
	var sample = samples[i]
	var result = mem.get(sample.x, sample.y)
	if (result !== null)
	{
		throw new Error('wut?')
	}
}

console.log('Will re-set items that were released.')
console.log('Now that memory is preallocated, it should be faster than 1st run.')
console.time('Memory2D.set 2')
for (var i = 0, l = samples.length; i < l; i++)
{
	var sample = samples[i]
	mem.set(sample.x, sample.y, sample.d)
}
console.timeEnd('Memory2D.set 2')

console.log('Will now test Memory2D.near.')
console.log('Since coords are random, results will vary.')

console.time('near 1')
console.log('#1 near(50, 50, 50) found: %d items', mem.near(50, 50, 50).length)
console.timeEnd('near 1')

console.time('near 2')
console.log('#2 near(-50, -50, 50) found: %d items', mem.near(-50, -50, 50).length)
console.timeEnd('near 2')

console.time('near 3')
console.log('#3 near(50, 50, 200) found: %d items', mem.near(50, 50, 200).length)
console.timeEnd('near 3')

console.time('near 4')
console.log('#4 near(0, 0, 1000) found: %d items', mem.near(0, 0, 1000).length)
console.timeEnd('near 4')


console.time('near MAX_AXIS')
var r = 0
console.log('#5 near(0, 0, MAX_AXIS) found: %d items', r = mem.near(0, 0, MAX_AXIS).length)
console.timeEnd('near MAX_AXIS')

// Make sure all samples were found.
if (r !== samples.length)
{
	throw new Error('wut?')
}
