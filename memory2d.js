/**
* Provides Memory2D class.
*
* @module Memory2D
*/
var Memory2D = (function() {

/**
* When setting data with `set`, that is outside the bounds of the spatial storage, 
* this is the minimum amount of storage that is allocated for both the x and y axis.
*
* @private
* @final
* @property MINIMUM_ALLOC
* @type Number
*/
const MINIMUM_ALLOC = 100

/**
* @class Memory2D
* @constructor
* @param [prealloc_x] {Number}
* @param [prealloc_y] {Number}
*/
function Memory2D(prealloc_x, prealloc_y)
{
	prealloc_x = prealloc_x >>> 0,
	prealloc_y = prealloc_y >>> 0

	if (!(this instanceof Memory2D))
	{
		return new Memory2D(prealloc_x, prealloc_y)
	}

	var instance = this
	var space = [[], []]
	var storage = [null]
	var freed = []
	var x_ulimit = 0
	var y_ulimit = 0
	var abs = Math.abs

	// -------------------------------------------------------------------------

	/**
	* Memory never shrinks. Everytime you call `unset` the item's index 
	* is preserved for later use. This function tries to reuse memory stored
	* in `storage`, otherwise it will create a new index by increasing the size
	* of `storage` by one, and thus create a new index.
	*
	* Used by `set`.
	*
	* @private
	* @method get_free_storage_index
	* @return Number
	*/
	function get_free_storage_index()
	{
		if (freed.length)
		{
			var freed_length = freed.length
			var freed_index = freed[freed_length - 1]
			freed.length = freed_length - 1
			return freed_index >>> 0
		}
		else
		{
			return storage.length >>> 0
		}
	}

	/**
	* Looks into spacial storage `space`, by using x and y coordinates and 
	* returns the index to where in `storage` the data is located.
	*
	* @private
	* @method retrieve
	* @param x {Number}
	* @param y {Number}
	* @return Number
	*/
	function retrieve(x, y)
	{
		x = x | 0,
		y = y | 0

		var x_abs = abs(x)
		var y_abs = abs(y)

		if (x_abs < x_ulimit && y_abs < y_ulimit)
		{
			return space[(x >= -0) >>> 0][x_abs][(y >= -0) >>> 0][y_abs] >>> 0
		}
		else
		{
			return 0
		}
	}

	/**
	* Memory never shrinks. Increases the size of the spatial storage. 
	* 
	* **Note** Growth is reflected in both the positive and negative value
	* of the axis, that is increasing the size in the x-axis by 100, means
	* the spatial storage will allocate space for coordinates between 
	* -100 and +100.
	* 
	* If the size of the spatial storage is already at -100 to 100 then it will 
	* grow in both directions by the specified size, so for example if we were
	* to pre-allocate another 100 in the x-axis, then the total space covered
	* by the spatial storage will be -200 to +200 in the x-axis.
	*
	* @method prealloc
	* @param [prealloc_x] {Number}
	* @param [prealloc_y] {Number}
	*/
	function prealloc(prealloc_x, prealloc_y)
	{
		prealloc_x = prealloc_x + x_ulimit,
		prealloc_y = prealloc_y + y_ulimit

		for (var x_sign = 0; x_sign < 2; x_sign++)
		{
			for (var x = x_ulimit; x < prealloc_x; x++)
			{
				space[x_sign][x] = [[],[]]
				
				for (var y_sign = 0; y_sign < 2; y_sign++)
				{
					for (var y = y_ulimit; y < prealloc_y; y++)
					{
						space[x_sign][x][y_sign][y] = [0]
					}
				}
			}
		}

		x_ulimit = prealloc_x, 
		y_ulimit = prealloc_y
	}

	/**
	* Releases (nullifies) storage. The `storage` index will be **freed** 
	* in order to reuse the space that is now empty.
	* 
	* The item stored will be returned. Just like an `Array.pop`.
	* 
	* @method unset
	* @param [prealloc_x] {Number}
	* @param [prealloc_y] {Number}
	* @return {Mixed}
	*/
	function unset(x, y)
	{
		x = x | 0,
		y = y | 0
		
		var x_abs = abs(x)
		var y_abs = abs(y)

		if (x_abs < x_ulimit && y_abs < y_ulimit)
		{
			var index = retrieve(x, y)

			if (index)
			{
				var item = storage[index]
				storage[index] = null
				space[(x >= -0) >>> 0][x_abs][(y >= -0) >>> 0][y_abs] = 0
				freed[freed.length] = index
				return item
			}
		}

		return null
	}

	/**
	* Sets data in storage and stores its index, using x and y coordinates.
	*
	* The index where the item is stored in `storage` and it is is returned.
	*
	* @method set
	* @param x {Number}
	* @param y {Number}
	* @param data {Mixed}
	* @return Number index stored in `storage`
	*/
	function set(x, y, data)
	{
		x = x,
		y = y

		var x_abs = abs(x)
		var y_abs = abs(y)

		if (x_abs < x_ulimit && y_abs < y_ulimit)
		{
			var index = (retrieve(x, y) || get_free_storage_index()) >>> 0
			space[(x >= -0) >>> 0][x_abs][(y >= -0) >>> 0][y_abs] = index
			storage[index] = data
			return index
		}
		else
		{
			var prealloc_x = x_abs - x_ulimit
			var prealloc_y = y_abs - y_ulimit
			var prealloc_val = prealloc_x >= prealloc_y ? prealloc_x : prealloc_y
			prealloc_val = prealloc_val < MINIMUM_ALLOC ? MINIMUM_ALLOC : prealloc_val
			prealloc(prealloc_val, prealloc_val)
			return set(x, y, data)
		}
	}

	/**
	* Get item in storage, using x and y coordinates.
	*
	* @method get
	* @param x {Number}
	* @param y {Number}
	* @return Mixed
	*/
	function get(x, y)
	{
		return storage[retrieve(x | 0 , y | 0) >>> 0]
	}

	/**
	* Returns an array of items stored near a given coordinate. How far to look
	* from the coordinate given is specified by the radius.
	*
	* **NOTE** radius does not mean the search will be circular, instead it is 
	* squared with the origin (ox and oy) at the center.
	* The width of the square is `radius * 2` and so is the height.
	*
	* @method near
	* @param ox {Number}
	* @param ox {Number}
	* @param radius {Number}
	* @return Array
	*/
	function near(ox, oy, radius)
	{
		ox = ox | 0, 
		oy = oy | 0, 
		radius = (radius >>> 0) + 1

		var end_x = ox + radius
		var end_y = oy + radius
		var found = []

		for (var x = ox - radius; x < end_x; x++)
		{
			for (var y = oy - radius; y < end_y; y++)
			{
				var index = retrieve(x, y)

				if (index)
				{
					found[found.length] = storage[index]
				}
			}
		}

		return found
	}

	// -------------------------------------------------------------------------

	Object.defineProperty(instance, 'get', {
		configurable: false, enumerable: true,
		value: function Memory2D__get(x, y){
			return get(x | 0, y | 0)
		}
	})

	Object.defineProperty(instance, 'set', {
		configurable: false, enumerable: true,
		value: function Memory2D__set(x, y, data){
			return set(x | 0, y | 0, data)
		}
	})

	Object.defineProperty(instance, 'unset', {
		configurable: false, enumerable: true,
		value: function Memory2D__unset(x, y){
			return unset(x | 0, y | 0)
		}
	})

	Object.defineProperty(instance, 'prealloc', {
		configurable: false, enumerable: true,
		value: function Memory2D__prealloc(x, y){
			prealloc(x >>> 0, y >>> 0)
		}
	})

	Object.defineProperty(instance, 'near', {
		configurable: false, enumerable: true,
		value: function Memory2D__near(x, y, r){
			return near(x | 0, y | 0, r >>> 0 || 10)
		}
	})

	Object.defineProperty(instance, 'space', {
		configurable: false, enumerable: true,
		get: function Memory2D__get_space(){
			return space
		}
	})

	Object.defineProperty(instance, 'storage', {
		configurable: false, enumerable: true,
		get: function Memory2D__get_storage(){
			return storage
		}
	})

	if (prealloc_x || prealloc_y)
	{
		prealloc(prealloc_x, prealloc_y)
	}
}

return Memory2D
})();
