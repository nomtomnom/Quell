

//======================================//
//========== CreateQueryStr ============//
//======================================//



 function CreateQueryStr(queryObject, operationType) {
  if (Object.keys(queryObject).length === 0) return ''
  const openCurly = '{';
  const closeCurly = '}';
  const openParen = '(';
  const closeParen = ')';

  let mainStr = '';

  // iterate over every key in queryObject
  // place key into query object
  for (let key in queryObject) {
    mainStr += ` ${key}${getAliasType(queryObject[key])}${getArgs(queryObject[key])} ${openCurly} ${stringify(queryObject[key])}${closeCurly}`;
  }

  // recurse to build nested query strings
  // ignore all __values (ie __alias and __args)
  function stringify(fields) {
    // initialize inner string
    let innerStr = '';
    // iterate over KEYS in OBJECT
    for (const key in fields) {
      // is fields[key] string? concat with inner string & empty space
      if (typeof fields[key] === "boolean") {
        innerStr += key + ' ';
      }
      // is key object? && !key.includes('__'), recurse stringify
      if (typeof fields[key] === 'object' && !key.includes('__')) {
        innerStr += `${key}${getAliasType(fields[key])}${getArgs(
          fields[key])} ${openCurly} ${stringify(
            fields[key])}${closeCurly} `;
      }
    }

    return innerStr;
  }

  // iterates through arguments object for current field and creates arg string to attach to query string
  function getArgs(fields) {
    let argString = '';
    if (!fields.__args) return '';

    Object.keys(fields.__args).forEach((key) => {
      argString
        ? (argString += `, ${key}: ${fields.__args[key]}`)
        : (argString += `${key}: ${fields.__args[key]}`);
    });

    // return arg string in parentheses, or if no arguments, return an empty string
    return argString ? `${openParen}${argString}${closeParen}` : '';
  }

  // if Alias exists, formats alias for query string
  function getAliasType(fields) {
    return fields.__alias ? `: ${fields.__type}` : '';
  };

  // create final query string
  const queryStr = openCurly + mainStr + ' ' + closeCurly;
  // if operation type supplied, place in front of queryString, otherwise just pass queryStr
  return operationType ? operationType + ' ' + queryStr : queryStr;
};


//======================================//
//===== updateProtoWithFragment ========//
//======================================//

function updateProtoWithFragment (protoObj, frags) {
  if (!protoObj) return; 
  // iterate over the typeKeys on proto
  for (const key in protoObj) {
    // if the current value is an object, then recruse through prototype 
    if (typeof protoObj[key] === 'object' && !key.includes('__')) {
      protoObj[key] = updateProtoWithFragment(protoObj[key], frags);
    }
    // else if the current key is the fragment key, then add all properties from frags onto prototype
    else if (frags.hasOwnProperty(key)) {
      protoObj = {...protoObj, ...frags[key]};
      // remove the fragment key from the prototype object
      delete protoObj[key];
    }
  }
  return protoObj;
}

//===============EXPORT=================//

export { CreateQueryStr,  updateProtoWithFragment };
