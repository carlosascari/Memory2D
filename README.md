# Memory2D

Fast retrieval and setting of objects in a 2D spatial storage.
100% Javascript.

Great care was taken to appeal to javascript engines, such as: using **Type Coercion** inspired by asm.js, as well as to limit the size of each function by less than 600 characters so they are **prospects for inlining**. Also, function calls as well as dereferencing is kept down to a absolute minimum. 

In short, Memory2D is designed to be efficiently compiled by any Javascript engine. In particular, Memory2D was made to be used in realtime, such as when listening to `mousemove` events without throttling.

Assuming no allocation is needed, all calls with the exeption of `near` and `prealloc` should be O(1).

Checkout the benchmark. 

Yes, benchmarking is complicated and the benchmark I set up is "naive" at best. Regardless, I am confident that the speed is large enough to clear any doubts at first sight. Also, feel free to tweak the `const` variables in memory2d-benchmakr.js in order to see the limits yourself.

### Usage

```js

// Instanciate
var mem = new Memory2D()

// Set data at x,y
var storage_index = mem.set(<x>, <y>, <data>)

// Get data stored in x,y
var data = mem.get(<x>, <y>)

// Release and return data at x, y
var data = mem.unset(<x>, <y>)

// Allocate MORE memory in x and/or y axis.
mem.prealloc(100, 100)

// Find data found near x, y with a search radius that is defined.
// Defaults: 10
var datas = mem.near(<x>, <y>, <radius>)

// 2D Space. First index is 0 for negative x, 1 for positive x.
//           Second index is x.
//           Third index is 0 for negative y, 1 for postive y.
// 			 Fourth index is for y.
mem.space

// Stored data. Array.
mem.storage
```
###  API

**methods**

- Memory2D:**prealloc**(*Number* **prealloc_x**, *Number* **prealloc_y**)
Increase the size of the spatial storage in the x and/or y-axis.
`set` calls this function internally when storing coordinates that are outside the bounds of available spatial space. If you have an idea of the minimum and max x and y coordinates you will supply, then you may want to preallocated it early since it does speed up setting data.
**Note** Since this is one of the heaviest methods (next to `near`), you may want o call this inside a async function such as setTimeout/setInterval so it does not block while it increases the size of the spatial storage.

- *Mixed* Memory2D:**get**(*Number* **x**, *Number* **y**)
Retrieves data stored at specified x and y coordinates. If there is not data allocated at the location then `null` will be returned.

- *Number* Memory2D:**set**(*Number* **x**, *Number* **y**, *Mixed* **data**)
Sets data at specified x and y coordinates. Data can be anything, including an Array, which can act as a z-axis. The index to where the data was stored in `storage` will be returned.

- *Mixed* Memory2D:**unset**(*Number* **x**, *Number* **y**)
Releases data stored at specified x and y coordinate. If data was stored, then it will be returned otherwise it will return `null`.

- *Array* Memory2D:**near**(*Number* **x**, *Number* **y**, [*Number*] **radius**)
Returns an array of items stored near a given coordinate. How far to look from the coordinate given is specified by the radius.
**NOTE** radius does not mean the search will be circular, instead it is squared with the origin (ox and oy) at the center.The width of the square is `radius * 2` and so is the height.

**properties**

- *Array* Memory2D:**storage**
Return array of data that have been stored as well as released. `storage` never shrinks, it only grows. Data that has been released with `unset` will appear as `null`.

- *Array* Memory2D:**space**
Return spatial storage. `space` is a special array with the following strucutre:

```
var storage_index = space[x_sign][x][y_sign][y]
```

Where *x_sign* and *y_sign* are either 0 if negative, or 1 if postive.

This is the available 2-Dimensional space that has been allocated. The final data that is stored is the index to where the actual data is stored in `storage`

### License
[The MIT License](http://opensource.org/licenses/MIT)