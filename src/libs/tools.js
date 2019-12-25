// 生成ID
export function genId () {
	return (Math.random() * 10000000).toString(16).substr(0, 4) + '_' + (new Date()).getTime() + '_' + Math.random().toString().substr(2, 5)
}

// 是否为数组
function paramsIsArray (params) {
	return Object.prototype.toString.call(params) == "[object Array]"
}

// 是否为对象
function paramsIsObject (params) {
	return Object.prototype.toString.call(params) == "[object Object]"
}

// 深克隆
export function deepClone (params) {
	let result;
	if (params && typeof params == "object") {
		result = Array.isArray(params) ? [] : {}
		for (let key in params) {
			if (paramsIsArray(params[key]) || paramsIsObject(params[key])) {
				result[key] = deepClone(params[key])
			} else {
				result[key] = params[key]
			}
		}
	} else {
		result = params
	}
	return result
}
