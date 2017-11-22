// j2sSwingJS.js 
// NOTE: updates to this file should be copies to j2sjmol.js

// latest author: Bob Hanson, St. Olaf College, hansonr@stolaf.edu

// NOTES by Bob Hanson

// BH 11/20/2017 8:59:46 PM fix for new double[3][3] 
// BH 11/19/2017 3:51:55 AM adds Clazz._traceOutput from URL j2strace=xxx where xxx appears in System.out.println, String.regionMatches
// BH 11/16/2017 10:52:53 PM adds method name aliasing for generics; adds String.contains$CharSequence(cs)
// BH 10/14/2017 8:17:57 AM removing all node-based dependency class loading; fix String.initialize with four arguments (arr->byte)
// BH 10/13/2017 7:03:28 AM fix for String.initialize(bytes) applying bytes as arguments
// BH 10/12/2017 6:34:01 AM totally re-written class loading using load(); no dependency nodes

// see earlier notes at swingjs/doc/j2snotes.txt
 
LoadClazz = function() {

if (!window["j2s.clazzloaded"])
  window["j2s.clazzloaded"] = false;

if (window["j2s.clazzloaded"])return;

window["j2s.clazzloaded"] = true;

window["j2s.object.native"] = true;

 /* http://j2s.sf.net/ *//******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Nov 5, 2005
 *******/
 


/**
 * Class Clazz. All the methods are static in this class.
 */
/* static */
/*Class = */ Clazz = {
  _isQuiet: false,
  _debugging: false,
  _nooutput: 0
};

;(function(Clazz, J2S) {


Clazz.popup = Clazz.log = Clazz.error = window.alert;

/* can be set by page JavaScript */
Clazz.defaultAssertionStatus = true;

/* can be set by page JavaScript */
Clazz._assertFunction = null;


Clazz.assert = function(clazz, obj, tf, msg) {
  if (!clazz.$_ASSERT_ENABLED_)return;
  var ok = true;
  try {
    ok = tf.apply(obj)
    if (!ok)
      msg = msg.apply(obj);  
  } catch (e) {
    ok = false;
  }
  if (!ok) {
    debugger;
    if (Clazz._assertFunction) {
      return Clazz._assertFunction(clazz, obj, msg || Clazz.getStackTrace());
    }
    Clazz.load("java.lang.AssertionError");
    if (msg == null)
      throw new AssertionError();
    else
      throw Clazz.new(AssertionError.c$$S, [msg]);
  }
}
//J2S._debugCode = false;

Clazz.load = function(cName, isFinalize) {
  if (!cName)
    return null;
  // the only missing piece?
  if (isFinalize) {
    var cl = cName;
    // C$.$clinit$ call to finalize all dependencies
    inheritClass(cl, Clazz.load(cl.$load$[0]));
    var interfacez = Clazz.load(cl.$load$[1]);
    if (interfacez != null)
      implementOf(cl, interfacez);
      delete cl.$load$;      
    return;
  }
  if (cName instanceof Array) {
    unwrapArray(cName);
    var cl = null;
    for (var i = 0; i < cName.length; i++)
      cl = Clazz.load(cName[i]);
    return cl;
  }
  if (typeof cName == "string") {
    if (cName.indexOf("Thread.") == 0) {
      Clazz._4Name("java.lang.Thread", null, null, true)
    }
    if (cName.indexOf("Thread") == 0)
      cName = "java.lang." + cName;
    return Clazz._4Name(cName, null, null, true);
  } 
  var cl = cName;
  cl.$clinit$ && cl.$clinit$();
  return cl;
}

/**
 * Create a new instance of a class. 
 * Accepts:
 *   a string  Clazz.new("java.util.Hashtable")
 *   a clazz (has .__CLASS_NAME__ and a default contructor)
 *   a specific class constructor such as c$$S
 *   a constructor from a one class (c, anonymous constructor) and a class to create, cl   
 *   
 */
  
Clazz.new = function(c, args, cl) {
  args || (args = [[]]);
  
  var t0 = (_profileNew ? window.performance.now() : 0);
  
  if (c.__CLASS_NAME__ && c.c$) 
    c = c.c$;
  else if (typeof c == "string")
    return Clazz.new(Clazz.load(c));
    
  // an inner class will attach arguments to the arguments returned
  // Integer will be passed as is here, without c.exClazz, or cl
  cl = cl || c.exClazz || c;
  cl.$clinit$ && cl.$clinit$();
  var f = new (Function.prototype.bind.apply(cl, arguments));
  if (args[2] != Clazz.inheritArgs)
    c.apply(f, args);
    
  _profileNew && addProfileNew(myclass, window.performance.now() - t0);

  return f;
}

Clazz.getClass = function(cl) {
  // $Class$ is the java.lang.Class object wrapper
  // $clazz$ is the unwrapped JavaScript object
  if (cl.$Class$)
    return cl.$Class$;
  java.lang.Class || Clazz.load("java.lang.Class");
  var Class_ = cl.$Class$ = new java.lang.Class();
  Class_.$clazz$ = cl;
  return Class_;
}

Clazz.super = function(cl, obj, andInit) {
  if (cl.superClazz && cl.superClazz.c$) {
    // added [] here to account for the possibility of vararg default constructor
    cl.superClazz.c$.apply(obj, [[]]);
  }
  if (andInit) {
    cl.$init$.apply(obj);
  }
}

Clazz.newInstance$ = function (objThis, args, isInner) {
  if (args && ( 
     args[0] == Clazz.inheritArgs 
     || args[1] == Clazz.inheritArgs 
     || args[2] == Clazz.inheritArgs 
  )) {
    // Just declaring a class, not creating an instance or doing field preparation.
    // That is, we are just generating the prototypes for this method using new superClass()
    return;
  }

  if (objThis.__VAL0__) {
    // Integer, Long, Byte, Float, Double
    // .instantialize(val)
    objThis.valueOf = function () {
      return this;
    };
  }
  
  objThis.__JSID__ = ++_jsid;

  if (!isInner) {
    if ((!args || args && args.length == 0) 
    && objThis.c$) {
    // allow for direct default call "new foo()" to run with its default constructor
      objThis.c$.apply(objThis);  
    }
    return;
  }
  // args[0] = outerObject
  // args[1] = b$ array
  // args[2-n] = actual arguments
  var outerObj = shiftArray(args, 0, 1);  
  var finalVars = shiftArray(args, 0, 1);
  var haveFinals = (finalVars || outerObj && outerObj.$finals);
  if (haveFinals) {
    // f$ is short for the once-chosen "$finals"
    var of$ = outerObj.$finals;
    objThis.$finals = (finalVars ? 
      (of$ ? appendMap(appendMap({}, of$), finalVars) : finalVars)
      : of$ ? of$ : null);
  }
  if (!outerObj || !objThis || !outerObj.__CLASS_NAME__)
    return;
  // BH: For efficiency: Save the b$ array with the OUTER class as $b$, 
  // as its keys are properties of it and can be used again.
  var b = outerObj.$b$;
  var isNew = false;
  var innerName = getClassName(objThis, true);
  if (!b) {
    b = outerObj.b$;
    // Inner class of an inner class must inherit all outer object references. Note that this 
    // can cause conflicts. For example, b$["java.awt.Component"] could refer to the wrong
    // object if I did this wrong.
    // 
    if (!b) {
      // the outer class is not itself an inner class - start a new map
      b = {};
      isNew = true;
    } else if (b["$ " + innerName]) {
      // this inner class is already in the map pointing to a different object. Clone the map.
      b = appendMap({},b);
      isNew = true;
    }
    // add all superclass references for outer object
    var clazz = Clazz.getClazz(outerObj);
    do {
      var key = getClassName(clazz, true);
      if (!isNew && b[key])
        break;
      b[key] = outerObj; 
    } while ((clazz = clazz.superClazz));
  }
  // add a flag to disallow any other same-class use of this map.
  b["$ " + innerName] = 1;
  // it is new, save this map with the OUTER object as $b$
  if (isNew)
    outerObj.$b$ = b;
  // final objective: save this map for the inner object
  objThis.b$ = b;
};

Clazz.defineStatics$ = function(cl, a) {
 for (var i = 0;i < a.length;){
   var s = a[i++]
   cl[s] = cl.prototype[s] = a[i++];
 }
}

/**
 * Expand the shortened list of class names.
 * For example:
 * JU.Log, $.Display, $.Decorations
 * will be expanded to 
 * JU.Log, JU.Display, JU.Decorations
 * where "$." stands for the previous class name's package.
 *
 * This method will be used to unwrap the required/optional classes list and 
 * the ignored classes list.
 */
/* private */
var unwrapArray = function (arr) {
  if (!arr || arr.length == 0)
    return [];
  var last = null;
  for (var i = 0; i < arr.length; i++) {
    var ai = arr[i];
    if (typeof ai != "string")
      continue;
    if (ai.charAt(0) == '$') {
      if (ai.charAt(1) == '.') {
        if (!last)
          continue;
        var idx = last.lastIndexOf(".");
        if (idx != -1) {
          var prefix = last.substring (0, idx);
          arr[i] = prefix + ai.substring(1);
        }
      } else {
        arr[i] = "org.eclipse.s" + ai.substring (1);
      }
    }
    last = arr[i];
  }
  return arr;
};

Clazz.newMethod$ = function (clazzThis, funName, funBody, isStatic) {
  if (funName.constructor == Array) {
    // If funName is an array, we are setting aliases for generic calls. 
    // For example: ['compareTo$S', 'compareTo$TK', 'compareTo$TA']
    // where K and A are generic types that are from a class<K> or class<A> assignment.    
    for (var i = funName.length; --i >= 0;)
      Clazz.newMethod$(clazzThis, funName[i], funBody, isStatic);
    return;
  }
  Clazz.saemCount0++;
  funBody.exName = funName;
  funBody.exClazz = clazzThis; // make it traceable
  var f;
  if (isStatic || funName == "c$")
    clazzThis[funName] = funBody;
  clazzThis.prototype[funName] = funBody; // allow static calls as though they were not static
};                     

var aas = "AAA";
/**
 * Create an array class placeholder for reflection
 */
Clazz.arrayClass$ = function(baseClass, ndim) {
  ndim || (ndim = 1);
  var stub = Clazz._getParamCode(baseClass);
  while (aas.length < ndim)
    aas += aas;
  var aaa = aas.substring(0, ndim);
  var o = {};
  o.arrayType = 1;
  o.__BASECLASS = baseClass;
  o.__NDIM = ndim;
  o.__CLASS_NAME__ = o.__ARRAYTYPE = stub + aaa;
  o.__COMPONENTTYPE = (o.__NDIM == 1 ? baseClass : null);
  var oclass = Clazz.getClass(o);
  oclass.getComponentType = function() { 
    return o.__COMPONENTTYPE 
      || (o.__COMPONENTTYPE = Clazz.arrayClass$(baseClass, ndim - 1)); 
  };
  oclass.getName = function() {return o.__NAME || (o__NAME = (function() {
    switch (stub) {
    case "O":
      stub = "Object";
      break;
    case "S":
      stub = "String";
      break;
    case "H":
      stub = "S";
      break;
    default:
      if (stub.length > 1)
        stub = baseClass.__CLASS_NAME__;
      break;
    }
    if (stub.indexOf(".") >= 0)
      stub = "L" + stub + ";";
    else if (stub.length > 1)
      stub = "Ljava.lang." + stub + ";";
    return aaa.replace(/A/g,"[") + stub;
  })())};
  return oclass;  
}

Clazz.newEnumConst$ = function(vals, c, enumName, enumOrdinal, args, cl) {
  var o = Clazz.new(c, args, cl);
  o.$name = enumName;
  o.$ordinal = enumOrdinal;
  var clazzEnum = c.exClazz;
  vals.push(clazzEnum[enumName] = clazzEnum.prototype[enumName] = o);
}
    
Clazz.newArray$ = function(baseClass, paramType, ndims, params) {
  // new Int[] {3, 4, 5} Clazz.newArray$(Integer.TYPE, -1, [3, 4, 5])    
  // new Int[][]{new int[] {3, 4, 5}, {new int[] {3, 4, 5}} 
  //     Clazz.newArray$(Integer.TYPE, -2, Clazz.newArray$(Integer.TYPE, -1, [3, 4, 5]), Clazz.newArray$(Integer.TYPE, -1, [3, 4, 5]) )    
  // new int[3]          Clazz.newArray$(Integer.TYPE, [3])
  // new int[3][3]       Clazz.newArray$(Integer.TYPE, [3, 3])
  // new int[3][]        Clazz.newArray$(Integer.TYPE, [3, null])
  // new char[3]         Clazz.newArray$(Character.TYPE, [3])
  // new String[3]       Clazz.newArray$(java.lang.String, [3])

  if (arguments[0] === -1) {
    // four-parameter option from JU.AU.arrayCopyObject;
    // truncate array using slice
    // Clazz.newArray$(-1, array, ifirst, ilast+1)
    var b = arguments[1];
    var a = b.slice(arguments[2], arguments[3]);
    a.__BYTESIZE = b.__BYTESIZE;
    a.__ARRAYTYPE = b.__ARRAYTYPE;
    a.__BASECLASS = b.__BASECLASS;
    return a;
  }
  var prim = Clazz._getParamCode(baseClass);
  if (arguments.length < 4) {
    // one-parameter option just for convenience, same as newArray$(String, 0)
    // two-parameter options for standard new foo[n], 
    //   Array.newInstance(class, length), and 
    //   Array.newInstance(class, [dim1, dim2, dim3....])
    // three-parameter option for (Integer.TYPE, -1, [3, 4, 5])
    var cl = baseClass;
    var values = ndims;
    var ndims = paramType || 0;
    var baseClass = cl.__BASECLASS || cl;
    var isNum = (typeof ndims == "number");  
    if (isNum && ndims >= -1) {
      return (ndims == -1 ? Clazz.newArray$(baseClass, prim + "A", -1, values) 
      : Clazz.newArray$(baseClass, prim + "A", (cl.__NDIM || 0) + 1, [ndims]));
    }      
    paramType = prim;
    params = (isNum ? values : ndims);
    ndims = params.length;
    for (var i = ndims; --i >= 0;) {
      paramType += "A";
      if (params[i] == null && !isNum)
        params.length--;
    }
    if (isNum)
      ndims = -ndims;
  }
  if (ndims < 0) {
    params = [-1, params];
  } else {
    var initValue = null;
    if (ndims >= 1) {
      switch (prim) {
      case "B":
      case "H": // short
      case "I":
      case "L":
      case "F":
      case "D":
        initValue = 0;
        break;
      case "C": 
        initValue = '\0';
        break;
      case "Z":
        initValue = false;
        break;
      }
    }
    params.push(initValue);
  }
  params.push(paramType);
  var nbits = 0;
  if (ndims != 0) {
    switch (prim) {
    case "B":
      nbits = 8;
      break; 
    case "H":
      nbits = 16;
      break;
    case "I":
    case "L":
      nbits = 32;
      break;
    case "F":
    case "D":
      nbits = 64;
      break;
    }  
  }
  return newTypedA$(baseClass, params, nbits, ndims);
}


/**
 * in-place shift of an array by k elements, starting with element i0,
 * resetting its length in case it is arguments (which does not have the
 * .shift() method. Returns a[i0] 
 */
var shiftArray = function(a, i0, k) {
  if (a == null || k > a.length)
    return null;
  k || (k == 1);
  i0 || (i0 == 0);
  var arg = a[i0];
  for (var i = i0, n = a.length - k; i < n; i++)
    a[i] = a[i + k];
  a.length -= k;
  return arg;
};

var getParamCode = Clazz._getParamCode = function(cl) {
  cl.$clazz$ && (cl = cl.$clazz$);
  return cl.__PARAMCODE || (cl.__PARAMCODE = cl.__CLASS_NAME__.replace(/java\.lang\./, "").replace(/\./g, '_'));
}

Clazz.getDeclaringClazzForMethod$ = function(obj, methodName) {
  var cl = obj.$Class$.$clazz$;
  return cl && cl[methodName] && cl[methodName].exClazz;
}

var newTypedA$ = function(baseClass, args, nBits, ndims) {
  var dim = args[0];
  if (typeof dim == "string")
    dim = dim.charCodeAt(0); // int[] a = new int['\3'] ???
  var last = args.length - 1;
  var paramType = args[last];
  var val = args[last - 1];
  if (last > 2) {
     // array of arrays
     // Clazz.newA$(3, 5, null, "SAA") // last = 3
    var xargs = new Array(last--); 
    for (var i = 0; i <= last; i++)
      xargs[i] = args[i + 1];
    // SAA -> SA
    xargs[last] = paramType.substring(0, paramType.length - 1);    
    var arr = new Array(dim);
    for (var i = 0; i < dim; i++)
      arr[i] = newTypedA$(baseClass, xargs, nBits, ndims - 1); // Call recursively
  } else {
    // Clazz.newIntA$(new int[5][]   val = null 
    // Clazz.newA$(5 ,null, "SA")        new String[5] val = null
    // Clazz.newA$(-1, ["A","B"], "SA")  new String[]   val = {"A", "B"}
    // Clazz.newA$(3, 5, 0, "IAA")       new int[3][5] (second pass, so now args = [5, 0, "IA"])
    if (val == null)
      nBits = 0;
    else if (nBits > 0 && dim < 0)
      dim = val; // because we can initialize an array using new Int32Array([...])
    if (nBits > 0)
      ndims = 1;
    var atype;
    switch (nBits) {
    case 8:
      var arr = new Int8Array(dim);
      break;
    case 16:
      var arr = new Int16Array(dim);
      break;
    case 32:
      var arr = new Int32Array(dim);
      break;
    case 64:
      var arr = new Float64Array(dim);
      break;
    default:
      var arr = (dim < 0 ? val : new Array(dim));
      nBits = 0;
      if (dim > 0 && val != null)
        for (var i = dim; --i >= 0;)
           arr[i] = val;
      break;
    }  
    arr.__BYTESIZE = arr.BYTES_PER_ELEMENT || (nBits >> 3);
  }
  arr.getClass = function () { return Clazz.arrayClass$(baseClass, Math.abs(ndims)) };
  arr.__ARRAYTYPE = paramType; // referenced in java.lang.Class
  arr.__BASECLASS = baseClass;
  arr.__NDIM = ndims;
  return arr;
}

try {
Clazz._debugging = (document.location.href.indexOf("j2sdebug") >= 0);
} catch (e) {
}

try {
 // will alert in system.out.println with a message
Clazz._traceOutput = 
(document.location.href.indexOf("j2strace=") >= 0 ? document.location.href.split("j2strace=")[1].split("&")[0] : null)
} catch (e) {
}

var __debuggingBH = false;

var _globals = ["j2s.clazzloaded", "j2s.object.native"];
Clazz.setGlobal = function(a, v) {
  _globals.push(a);
  window[a] = v;
}

Clazz.getGlobals = function() {
  return _globals.sort().join("\n");
}

Clazz.setConsoleDiv = function(d) {
  window["j2s.lib"] && (window["j2s.lib"].console = d);
};

var supportsNativeObject = window["j2s.object.native"]; // true


Clazz.duplicatedMethods = {};

//Clazz._preps = {}; // prepareFields functions based on class name

// BH Clazz.getProfile monitors exactly what is being delegated with SAEM,
// which could be a bottle-neck for function calling.
// This is critical for performance optimization.

var _profile = null;
var _profileNoOpt = false;  // setting this true will remove Bob's signature optimization

var __signatures = ""; 
var profilet0;
var _profileNew = null;
var _jsid0 = 0;

Clazz.startProfiling = function(doProfile) {
  if (typeof doProfile == "number") {
    _profileNew = (arguments[1] ? {} : null);
    _jsid0 = _jsid;
    setTimeout(function() { var s = "total wall time: " + doProfile + " sec\n" + Clazz.getProfile(); console.log(s); System.out.println(s)}, doProfile * 1000);
  }
  _profile = ((doProfile || arguments.length == 0) && self.JSON && window.performance ? {} : null);
  return (_profile ? "use Clazz.getProfile() to show results" : "profiling stopped and cleared")
}

var tabN = function(n) { n = ("" + n).split(".")[0]; return "..........".substring(n.length) + n + "\t" };

Clazz.getProfile = function() {
  var s = "run  Clazz.startProfiling() first";
  if (_profile) {
    var l = [];
    var totalcount = 0;
    var totalprep = 0;
    var totaltime = 0;
    for (var name in _profile) {
      var n = _profile[name][0];
      var t1 = _profile[name][1];
      var t2 = _profile[name][2];
      l.push(tabN(n) + tabN(t1) + tabN(t2) + name);
      totalcount += n
      totalprep += t1
      totaltime += t2
    }
    s = "\ncount   \tprep(ms)\texec(ms)\n" 
      + "--------\t--------\t--------\n" 
      + tabN(totalcount)+ tabN(totalprep)+tabN(totaltime) + "\n"
      + "--------\t--------\t--------\n" 
      + l.sort().reverse().join("\n")
      ;
    _profile = null;
    
    if (_profileNew) {
      s += "\n\n Total new objects: " + (_jsid - _jsid0) + "\n";
      s += "\ncount   \texec(ms)\n";
      s += "--------\t--------\t------------------------------\n";
      totalcount = 0;
      totaltime = 0;
      for (var key in _profileNew) {
        var count = _profileNew[key][0];
        var tnano = _profileNew[key][1];
        totalcount += count
        totaltime += tnano
        s += tabN(count) + tabN(tnano) + "\t" +key + "\n";
      }
      s+= tabN(totalcount)+tabN(totaltime) + "\n"
    }
  }
  _profileNew = null;
  return s; //+ __signatures;
}


var addProfile = function(c, f, p, t1, t2) {
  var s = c.__CLASS_NAME__ + " " + f + " ";// + JSON.stringify(p);
  if (__signatures.indexOf(s) < 0)
    __signatures += s + "\n";
  var p = _profile[s];
  p || (p = _profile[s] = [0,0,0]);
  p[0]++;
  p[1] += t1;
  p[2] += t2;
}

var addProfileNew = function(c, t) {
  var s = c.__CLASS_NAME__;
  var p = _profileNew[s]; 
  p || (p = _profileNew[s] = [0,0]);
  p[0]++;
  p[1]+=t;
}
   

/**
 * show all methods that have the same signature.
 *  
 */
Clazz.showDuplicates = function(quiet) {
  var s = "";
  var a = Clazz.duplicatedMethods;
  var n = 0;
  for (var key in a)
    if (a[key] > 1) {
      s += a[key] + "\t" + key + "\n";
      n++;
    }
  s = "Duplicates: " + n + "\n\n" + s;
  System.out.println(s);
  if (!quiet)
    alert(s);
}

/**
 * Return the JavaScript clazz of the given class or object.
 *
 * @param clazzHost given class or object
 * @return class name
 */
/* public */
Clazz.getClazz = function (clazzHost) {
  if (!clazzHost)
    return Clazz._O;  // null/undefined is always treated as Object
  if (typeof clazzHost == "function")
    return clazzHost;
  var clazzName;
  if (clazzHost._NULL_) {
    clazzName = clazzHost.clazzName;
  } else {
    switch (typeof clazzHost) {
    case "string":
      return String;
    case "object":
      if (!clazzHost.__CLASS_NAME__)
        return (clazzHost.constructor || Clazz._O);
      clazzName = clazzHost.__CLASS_NAME__;
    break;
    default:
      return clazzHost.constructor;
    }
  }
  return evalType(clazzName, true);
};


///////////////////// method creation ////////////////////////////////

var doDebugger = function() { debugger }

var _declared = {};

var checkDeclared = function(name, type) {
  if (J2S._debugName && name.toLowerCase() == J2S._debugName)doDebugger();
  if (_declared[name] == type) {
    var s = (type == 1 ? "interface" : "class") +" " + name + " is defined twice. A prior core file has probably needed to load a class that is in the current core file. Check to make sure that package.js declares the first class read in jarClassPath or that BuildCompress has included all necessary files."
    System.out.println(s);
    if (J2S._debugCore)
      doDebugger();
    }
  _declared[name] = type;
}

Clazz.newPackage$ = function (pkgName) {

  Clazz._Loader && Clazz._Loader.doTODO();

  if (Clazz.lastPackageName == pkgName || !pkgName)
    return Clazz.lastPackage;
  var pkgFrags = pkgName.split (/\./);
  var pkg = Clazz.allPackage;
  for (var i = 0; i < pkgFrags.length; i++) {
    var a = pkgFrags[i];
    if (!pkg[a]) {
      pkg[a] = {  __PKG_NAME__ : (pkg.__PKG_NAME__ ? pkg.__PKG_NAME__ + "." + a : a) }
      if (i == 0) {
        // window[a] = ...
        Clazz.setGlobal(a, pkg[a]);
      }
    }
    pkg = pkg[a]
  }
  Clazz.lastPackageName = pkgName;
  return Clazz.lastPackage = pkg;
};

Clazz.newInterface$ = function (prefix, name, interfacez) {
  var clazzFun = function () {};
  if (J2S._debugCore)
    checkDeclared((prefix.__PKG_NAME__ || prefix.__CLASS_NAME__) + "." + name, 1);
  return decorateFunction(clazzFun, prefix, name, [null, interfacez]);
};

Clazz.newClass$ = function (prefix, name, clazzFun, clazzParent, 
    interfacez, type) {
  var prefixName = (prefix ? prefix.__PKG_NAME__ || prefix.__CLASS_NAME__ : null);
  var qName = (prefixName ? prefixName + "." : "") + name;
  
  
/*  if (Clazz._Loader._classPending[qName]) {
      delete Clazz._Loader._classPending[qName];
      Clazz._Loader._classCountOK++;
      Clazz._Loader._classCountPending--;
    }
*/
//  if (Clazz._Loader && Clazz._Loader._checkLoad) {
    Clazz._lastDecorated = prefixName + "." + name
//  }
  if (unloadedClasses[qName])
    clazzFun = unloadedClasses[qName];
  else if (!clazzFun)
    clazzFun = function () {Clazz.newInstance$(this,arguments)};
  return decorateFunction(clazzFun, prefix, name, [clazzParent, interfacez], type);
};


Clazz.cloneFinals = function () {
  var o = {};
  var len = arguments.length / 2;
  for (var i = len; --i >= 0;)
    o[arguments[i + i]] = arguments[i + i + 1];
  return o;
};

Clazz.isClassDefined = function(clazzName) {
  if (!clazzName) 
    return false;    /* consider null or empty name as non-defined class */
  if (Clazz.allClasses[clazzName])
    return true;
  var pkgFrags = clazzName.split (/\./);
  var pkg = null;
  for (var i = 0; i < pkgFrags.length; i++)
    if (!(pkg = (pkg ? pkg[pkgFrags[i]] : Clazz.allPackage[pkgFrags[0]]))) {
      return false;
    }
  return (pkg && (Clazz.allClasses[clazzName] = pkg));
};

/**
 * Return the class name of the given class or object.
 *
 * @param clazzHost given class or object
 * @return class name
 */
var getClassName = function(obj, fAsClassName) {
  if (obj == null)
    return "NullObject";
  if (obj._NULL_)
    return obj.clazzName;
  switch(typeof obj) {
  case "number":
    return "n";
  case "boolean":
    return "b";
  case "string":
    // Always treat the constant string as String object.
    // This will be compatiable with Java String instance.
    return "String";
  case "function":
    if (obj.__CLASS_NAME__)
      return (fAsClassName ? obj.__CLASS_NAME__ : "Class"); // user defined class name
    var s = obj.toString();
    var idx0 = s.indexOf("function");
    if (idx0 < 0)
      return (s.charAt(0) == '[' ? extractClassName(s) : s.replace(/[^a-zA-Z0-9]/g, ''));
    var idx1 = idx0 + 8;
    var idx2 = s.indexOf ("(", idx1);
    if (idx2 < 0)
      return "Object";
    s = s.substring (idx1, idx2);
    if (s.indexOf("Array") >= 0)
      return "Array"; 
    s = s.replace (/^\s+/, "").replace (/\s+$/, "");
    return (s == "anonymous" || s == "" ? "Function" : s);
  case "object":
    if (obj.__CLASS_NAME__) // user defined class name
      return obj.__CLASS_NAME__;
    if (!obj.constructor)
      return "Object"; // For HTML Element in IE
    if (!obj.constructor.__CLASS_NAME__) {
      if (obj.__VAL0__)
        return "Number";
      if (obj instanceof Boolean)
        return "Boolean";
      if (obj instanceof Array || obj.__BYTESIZE)
        return "Array";
      var s = obj.toString();
      // "[object Int32Array]"
      if (s.charAt(0) == '[')
        return extractClassName(s);
    }
    return getClassName(obj.constructor, true);
  }
  // some new, unidentified class
  return "Object";
};

var extractClassName = function(clazzStr) {
  // [object Int32Array]
  var clazzName = clazzStr.substring (1, clazzStr.length - 1);
  return (clazzName.indexOf("Array") >= 0 ? "Array" // BH -- for Float64Array and Int32Array
    : clazzName.indexOf ("object ") >= 0 ? clazzName.substring (7) // IE
    : clazzName);
}

///////////////////////// private supporting method creation //////////////////////

var appendMap = function(a, b) {
  if (b)
    for (var s in b) {
        a[s] = b[s];
    }
  return a;
}

var hashCode = 0;

var NullObject = function () {};

if (supportsNativeObject) {
  Clazz._O = function () {};
  Clazz._O.__CLASS_NAME__ = "Object";
  Clazz._O.__PARAMCODE = "O";
  Clazz._O["getClass"] = function () { return Clazz._O; }; 
} else {
  Clazz._O = Object;
}

var addProto = function(proto, name, func) {
  return proto[name] = func;
};

// very important that toString be LAST here
var extendedObjectMethods = Clazz._extendedObjectMethods = [ "isInstance", "getClass", 
  "clone", "finalize", "notify", "notifyAll", "wait", 
  "equals", "equals$O", "hashCode", // not String
  "to$tring", "toString" // not String, Array, Boolean
  ];

var extendObject = function(clazz) {
  var limit = (clazz === Array || clazz === Number ? 2 : clazz === String ? 5 : 0);
  var n = Clazz._extendedObjectMethods.length - limit;
  var obj = Clazz._O.prototype;
  var proto = clazz.prototype;
  for (var i = 0; i < n; i++) {
    var p = Clazz._extendedObjectMethods[i];
    proto[p] = obj[p];
  }
}

{
  var proto = Clazz._O.prototype;

  addProto(proto, "isInstance", function(c) {
    return Clazz.instanceOf(this, c);
  }),

  addProto(proto, "equals", function (obj) {
    return this == obj;
  });

  addProto(proto, "equals$O", function (obj) {
    return this == obj;
  });

  addProto(proto, "hashCode", function () {
  
    return this._$hashcode || (this._$hashcode = ++hashCode)

/*  
    try {
      return this.toString ().hashCode ();
    } catch (e) {
      var str = ":";
      for (var s in this) {
        str += s + ":"
      }
      return str.hashCode ();
    }
*/
  });

  addProto(proto, "getClass", function () { return Clazz.getClass(this); });

  addProto(proto, "clone", function () { return Clazz.clone(this); });

  // BH allows @j2sNative access without super constructor
  Clazz.clone = function(me) { 
    return appendMap(me.__ARRAYTYPE ? Clazz.newArray$(me.__BASECLASS, me.__ARRAYTYPE, -1, [-2, me])
     : new me.constructor(Clazz.inheritArgs), me); 
  }
/*
 * Methods for thread in Object
 */
  addProto(proto, "finalize", function () {});
  addProto(proto, "notify", function () {});
  addProto(proto, "notifyAll", function () {});
  addProto(proto, "wait", function () {});
  addProto(proto, "to$tring", Object.prototype.toString);
  addProto(proto, "toString", function () { return (this.__CLASS_NAME__ ? "[" + this.__CLASS_NAME__ + " object]" : this.to$tring.apply(this, arguments)); });

}
    
var extendJO = function(c, name, name$, type, isNumber) {
  name && (c.__CLASS_NAME__ = c.prototype.__CLASS_NAME__ = name);
  name$ && (c.__CLASS_NAME$__ = c.prototype.__CLASS_NAME$__ = name$);  // inner static classes use $ not "."
  (type == 1) && (c.__ANON = c.prototype.__ANON = 1);
  (type == 2) && (c.__LOCAL = c.prototype.__LOCAL = 1);
  if (supportsNativeObject) {

    c.isInstance = function(o) { return Clazz.instanceOf(o, this) };

    for (var i = 0; i < extendedObjectMethods.length; i++) {
      var p = extendedObjectMethods[i];
      addProto(c.prototype, p, Clazz._O.prototype[p]);
    }
  }
  
  if (isNumber) {
    c.equals = inF.equals;
    c.getName = inF.getName;
  }

};

/**
 * Implementation of Java's keyword "implements".
 * As in JavaScript there are on "implements" keyword implemented, a property
 * of "implementz" is added to the class to record the interfaces the class
 * is implemented.
 * 
 * @param clazzThis the class to implement
 * @param interfacez Array of interfaces
 */
var implementOf = Clazz._implementOf = function (clazzThis, interfacez) {
  if (!interfacez)
    return;
  var i;
  if (arguments.length >= 2) {
    var impls = clazzThis.implementz || (clazzThis.implementz = []);
    if (arguments.length == 2) {
      if (typeof interfacez == "string") {
        i = interfacez;
        if (!(interfacez = Clazz.load(interfacez))) {
          alert("Missing interface: " + i);
          return;
        }
      }
      if (!(interfacez instanceof Array)) {
        impls.push(interfacez);
        copyProperties(clazzThis, interfacez);
        return;
      } 
      i = -1;
    } else {
      i = 0;
      interfacez = arguments;
    }
    while( ++i < interfacez.length)
      implementOf(clazzThis, interfacez[i]);
  }
};

Clazz.saemCount0 = 0 // methods defined        5400 (Ripple.js)
Clazz.saemCount1 = 0 // delegates created       937
Clazz.saemCount2 = 0 // delegates bound         397
Clazz.saemCount3 = 0 // getInheritedLevels started      
Clazz.saemCount4 = 0 // getInheritedLevels checked

var evalType = function (typeStr, isQualified) {
  if (typeStr == null)
    return null;
  var idx = typeStr.lastIndexOf(".");
  if (idx >= 0) {
    var pkgName = typeStr.substring (0, idx);
    var pkg = Clazz.newPackage$(pkgName);
    var clazzName = typeStr.substring (idx + 1);
    return pkg[clazzName];
  } 
  if (isQualified)
    return window[typeStr];
  switch (typeStr) {
  case "string":
    return String;
  case "number":
    return Number;
  case "object":
    return Clazz._O;
  case "boolean":
    return Boolean;
  case "function":
    return Function;
  case "void":
  case "undefined":
  case "unknown":
    return typeStr;
  case "NullObject":
    return NullObject;
  default:
    return window[typeStr];
  }
};

var equalsOrExtendsLevel = function (clazzThis, clazzAncestor) {
  if (clazzThis === clazzAncestor)
    return 0;
  if (clazzThis.implementz) {
    var impls = clazzThis.implementz;
    for (var i = 0; i < impls.length; i++) {
      var level = equalsOrExtendsLevel (impls[i], clazzAncestor);
      if (level >= 0) {
        return level + 1;
        }
    }
  }
  return -1;
};

/////////////////////// inner function support /////////////////////////////////

/**
 * Once there are other methods registered to the Function.prototype, 
 * those method names should be add to the following Array.
 */
/*
 * static final member of interface may be a class, which may
 * be function.
 */

Clazz.getInheritedLevel = function (clazzTarget, clazzBase, isTgtStr, isBaseStr) {
  if (clazzTarget === clazzBase)
    return 0;
  if (clazzBase.$load$)
    Clazz.load(clazzBase,1);
  if (isTgtStr && ("void" == clazzTarget || "unknown" == clazzTarget))
    return -1;
  if (isBaseStr && ("void" == clazzBase || "unknown" == clazzBase))
    return -1;
  if (clazzTarget === (isTgtStr ? "NullObject" : NullObject)) {
    switch (clazzBase) {
    case "n":
    case "b":
      return -1;
    case Number:
    case Boolean:
    case NullObject:
      break;
    default:
      return 0;
    }
  }  
  
  if (isTgtStr)
    clazzTarget = evalType(clazzTarget);
  if (isBaseStr)
    clazzBase = evalType(clazzBase);
  if (!clazzBase || !clazzTarget)
    return -1;
  var level = 0;
  var zzalc = clazzTarget; // zzalc <--> clazz
  while (zzalc !== clazzBase && level < 10) {
    /* maybe clazzBase is interface */
    if (zzalc.implementz) {
      var impls = zzalc.implementz;
      for (var i = 0; i < impls.length; i++) {
        var implsLevel = equalsOrExtendsLevel (impls[i], clazzBase);
        if (implsLevel >= 0)
          return 1//level + implsLevel + 1 + (clazzBase.$$INT$$ == clazzBase ? -0.2 : 0);
      }
    }
    zzalc = zzalc.superClazz;
    if (!zzalc)
      return (clazzBase === Object || clazzBase === Clazz._O ? 
        // getInheritedLevel(String, CharSequence) == 1
        // getInheritedLevel(String, Object) == 1.5
        // So if both #test(CharSequence) and #test(Object) existed,
        // #test("hello") will correctly call #test(CharSequence)
        // instead of #test(Object).
        1//level + 1.5 // 1.5! Special!
      : -1);
    level++;
  }
  return level;
};

var innerNames = [
  "equals", "equals$O", "hashCode" /*"toString",*/ 
];

/*
 * Static methods
 */
var inF = Clazz._inF = {
  equals : function (aFun) { return this === aFun; },
  hashCode : function () { return this.__CLASS_NAME__.hashCode (); },
  toString : function () { return "class " + this.__CLASS_NAME__; } 
};

inF.equals$O = inF.equals;

 
for (var i = innerNames.length, name; --i >= 0;)
  Clazz._O[name = innerNames[i]] = Array[name] = inF[name];

/*
 * Copy members of interface
 */
/* private */
var copyProperties = function(clazzThis, clazzSuper) {
  for (var o in clazzSuper)
    if (!excludeSuper(o)
        && (typeof clazzSuper[o] != "function" || !checkInnerFunction(clazzSuper, o)))
      clazzThis[o] = clazzThis.prototype[o] = clazzSuper[o];
};

/* private */
var checkInnerFunction = function (hostSuper, funName) {
  for (var k = innerNames.length; --k >= 0;)
    if (funName == innerNames[k] && 
        inF[funName] === hostSuper[funName])
      return true;
  return false;
};

//////////////////////////////// public method execution /////////////////////////

/**
 * Implements Java's keyword "instanceof" in JavaScript's way.
 * As in JavaScript part of the object inheritance is implemented in only-
 * JavaScript way.
 *
 * @param obj the object to be tested
 * @param clazz the class to be checked
 * @return whether the object is an instance of the class
 */
/* public */
Clazz.instanceOf = function (obj, clazz) {
  // allows obj to be a class already, from arrayX.getClass().isInstance(y)
  // unwrap java.lang.Class to JavaScript clazz
  if (typeof clazz == "string") {
    clazz = window[clazz];
  }
  
  return (obj != null && clazz && 
  (obj == (clazz.$clazz$ ? (clazz = clazz.$clazz$) : clazz)
    || (obj.__ARRAYTYPE || clazz.__ARRAYTYPE ? 
            obj.__ARRAYTYPE == clazz.__ARRAYTYPE 
            || obj.__ARRAYTYPE && clazz.__ARRAYTYPE && obj.__NDIM == clazz.__NDIM 
               && Clazz.getInheritedLevel(getClassName(obj.__BASECLASS, true), clazz.__BASECLASS, true) >= 0
    : obj instanceof clazz || Clazz.getInheritedLevel(getClassName(obj), clazz, true) >= 0)));
};

/////////////////////////// Exception handling ////////////////////////////

/*
 * Use to mark that the Throwable instance is created or not.
 * 
 * Called from java.lang.Throwable, as defined in JSmolJavaExt.js
 * 
 * The underscore is important - it tells the JSmol ANT task to NOT 
 * turn this into Clazz_initializingException, because coreBottom2.js does 
 * not include that call, and so Google Closure Compiler does not minify it.
 *        
 */
/* public */
Clazz._initializingException = false;

/** 
 * MethodException will be used as a signal to notify that the method is
 * not found in the current clazz hierarchy.
 */
/* private */
var MethodException = function () {
  this.toString = function () {
    return "j2s MethodException";
  };
};
/* private */
//var MethodNotFoundException = function () {
//  this.toString = function () {
//    return "j2s MethodNotFoundException";
//  };
//};

  var _isNPEExceptionPredicate;

;(function() { 
  /* sgurin: native exception detection mechanism. Only NullPointerException detected and wrapped to java excepions */
  /** private utility method for creating a general regexp that can be used later  
   * for detecting a certain kind of native exceptions. use with error messages like "blabla IDENTIFIER blabla"
   * @param msg String - the error message
   * @param spliterName String, must be contained once in msg
   * spliterRegex String, a string with the regexp literal for identifying the spitter in exception further error messages.
   */
  // reproduce NullPointerException for knowing how to detect them, and create detector function Clazz._isNPEExceptionPredicate
  var $$o$$ = null;
  
  try {
    $$o$$.hello();
  } catch (e) {
    var _ex_reg = function(msg, spliterName, spliterRegex) {
      if(!spliterRegex) 
        spliterRegex="[^\\s]+";  
      var idx = msg.indexOf (spliterName), 
        str = msg.substring (0, idx) + spliterRegex + msg.substring(idx + spliterName.length), 
        regexp = new RegExp("^"+str+"$");
      return regexp;
    };
    if(/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {// opera throws an exception with fixed messages like "Statement on line 23: Cannot convert undefined or null to Object Backtrace: Line....long text... " 
      var idx1 = e.message.indexOf(":"), idx2 = e.message.indexOf(":", idx1+2);
      var _NPEMsgFragment = e.message.substr(idx1+1, idx2-idx1-20);
      _isNPEExceptionPredicate = function(e) { return e.message.indexOf(_NPEMsgFragment)!=-1; };
    }  else if(navigator.userAgent.toLowerCase().indexOf("webkit")!=-1) { //webkit, google chrome prints the property name accessed. 
      var _exceptionNPERegExp = _ex_reg(e.message, "hello");
      _isNPEExceptionPredicate = function(e) { return _exceptionNPERegExp.test(e.message); };
    }  else {// ie, firefox and others print the name of the object accessed: 
      var _exceptionNPERegExp = _ex_reg(e.message, "$$o$$");
      _isNPEExceptionPredicate = function(e) { return _exceptionNPERegExp.test(e.message); };
    }    
  };
})();

/**sgurin
 * Implements Java's keyword "instanceof" in JavaScript's way **for exception objects**.
 * 
 * calls Clazz.instanceOf if e is a Java exception. If not, try to detect known native 
 * exceptions, like native NullPointerExceptions and wrap it into a Java exception and 
 * call Clazz.instanceOf again. if the native exception can't be wrapped, false is returned.
 * 
 * @param obj the object to be tested
 * @param clazz the class to be checked
 * @return whether the object is an instance of the class
 * @author: sgurin
 */
Clazz.exceptionOf = function(e, clazz) {
  if(e.__CLASS_NAME__)
    return Clazz.instanceOf(e, clazz);
  if (!e.getMessage) {
    e.getMessage = function() {return "" + this};
  }
  if (!e.printStackTrace) {
    e.printStackTrace = function(){};
    //alert(e + " try/catch path:" + Clazz.getStackTrace(-10));
  }
  if(clazz == Error) {
    if (("" + e).indexOf("Error") < 0)
      return false;
    System.out.println (Clazz.getStackTrace());
    return true;
    // everything here is a Java Exception, not a Java Error
  }
  return (clazz == Exception || clazz == Throwable
    || clazz == NullPointerException && _isNPEExceptionPredicate(e));
};

/**
 * BH need to limit this, as JavaScript call stack may be recursive
 */ 
Clazz.getStackTrace = function(n) {
  n || (n = 25);
  // updateNode and updateParents cause infinite loop here
  var s = "\n";
  var c = arguments.callee;
  var showParams = (n < 0);
  if (showParams)
    n = -n;
  for (var i = 0; i < n; i++) {
    if (!(c = c.caller))
      break;
    var sig = (c.toString ? c.toString().substring(0, c.toString().indexOf("{")) : "<native method>");
    s += i + " " + (c.exName ? (c.overrider ? c.overrider.__CLASS_NAME__ + "."  : "") + c.exName  + sig.replace(/function /,""): sig) + "\n";
    if (c == c.caller) {
      s += "<recursing>\n";
      break;
    }
    if (showParams) {
      var args = c.arguments;
      for (var j = 0; j < args.length; j++) {
        var sa = (args[j] instanceof Object ? args[j].toString() : "" + args[j]);
        if (sa.length > 60)
          sa = sa.substring(0, 60) + "...";
        s += " args[" + j + "]=" + sa.replace(/\s+/g," ") + "\n";
      }
    }
  }
  return s;
}

////////////////////////////////// package loading ///////////////////////

/*
 * all root packages. e.g. java.*, org.*, com.*
 */
Clazz.allPackage = {};


/**
 * Will be used to keep value of whether the class is defined or not.
 */
Clazz.allClasses = {};

Clazz.lastPackageName = null;
Clazz.lastPackage = null;

var unloadedClasses = [];

/**
 * used specifically for declaring prototypes using 
 *  subclass.prototype = new superclass(Clazz.inheritArgs) 
 * without  running a constructor or doing field preparation.    
 *  
 */ 
Clazz.inheritArgs = new (function(){return {"$J2SNOCREATE$":true}})();

//var _prepOnly = new (function(){return {"$J2SPREPONLY$":true}})();

var _jsid = 0;

var decorateFunction = Clazz._decorateFunction = function (clazzFun, prefix, name, parentAndInterfaces, type) {
  var qName, bName;
  if (!prefix) {
    // e.g. Clazz.declareInterface (null, "ICorePlugin", org.eclipse.ui.IPlugin);
    qName = name;
    Clazz.setGlobal(name, clazzFun);
  } else if (prefix.__PKG_NAME__) {
    // e.g. Clazz.declareInterface (org.eclipse.ui, "ICorePlugin", org.eclipse.ui.IPlugin);
    qName = prefix.__PKG_NAME__ + "." + name;
    prefix[name] = clazzFun;
    if (prefix === java.lang) {
      Clazz.setGlobal(name, clazzFun);
    }
  } else {
    // e.g. Clazz.declareInterface (org.eclipse.ui.Plugin, "ICorePlugin", org.eclipse.ui.IPlugin);
    qName = prefix.__CLASS_NAME__ + "." + name;
    bName = prefix.__CLASS_NAME__ + "$" + name;    
    prefix[name] = clazzFun;
  }
  extendJO(clazzFun, qName, bName, type);
  Clazz.setGlobal(qName, clazzFun);
  for (var i = innerNames.length; --i >= 0;) {
    clazzFun[innerNames[i]] = inF[innerNames[i]];
  }

//  if (Clazz._Loader) 
  //  Clazz._Loader.updateNodeForFunctionDecoration(qName);
    clazzFun.$load$ = parentAndInterfaces;
  return clazzFun;

};


var excludeSuper = function(o) {
 return o == "b$"
      || o == "$init$"
      || o == "c$" 
      || o == "$Class$"
      || o == "prototype" 
      || o == "__CLASS_NAME__" 
      || o == "__CLASS_NAME$__" 
      || o == "superClazz"
      || o == "implementz"
}
/**
 * Inherit class with "extends" keyword and also copy those static members. 
 * Example, as in Java, if NAME is a static member of ClassA, and ClassB 
 * extends ClassA then ClassB.NAME can be accessed in some ways.
 *
 * @param clazzThis child class to be extended
 * @param clazzSuper super class which is inherited from
 */
var inheritClass = function(clazzThis, clazzSuper, objSuper){
  if (clazzSuper) {  
  //var thisClassName = getClassName (clazzThis);
    for (var o in clazzSuper) {
      if (clazzThis[o] == undefined
      && !excludeSuper(o)
      && !checkInnerFunction (clazzSuper, o))
        clazzThis[o] = clazzSuper[o];
    }
    var p = clazzThis.prototype;
    if (unloadedClasses[getClassName(clazzThis, true)]) {
      // Don't change clazzThis.protoype! Keep it!
    } else if (clazzSuper == Number) {
      clazzThis.prototype = new Number ();
    } else {
      clazzThis.prototype = new clazzSuper (null, Clazz.inheritArgs);     
    } 
    for (o in p)
      clazzThis.prototype[o] = p[o];
  }
  clazzThis.prototype.__CLASS_NAME__ = clazzThis.__CLASS_NAME__;
  clazzThis.superClazz = clazzSuper;
};

////////////////////////// default package declarations ////////////////////////


/*
 * Check whether given package's classpath is setup or not.
 * Only "java" and "org.eclipse.swt" are accepted in argument.
 */
/* private */
var needPackage = function(pkg) {
  // note that false != null and true != null
  return (window[pkg + ".registered"] != null && !classpathMap["@" + pkg]);
}

  // Make sure that packageClasspath ("java", base, true); 
  // is called before any _Loader#loadClass is called.

  if (needPackage("java"))
    _Loader.loadPackage("java");

Clazz.newPackage$("java.io");
//Clazz.newPackage$("java.lang");
Clazz.newPackage$("java.lang.annotation");
Clazz.newPackage$("java.lang.instrument");
Clazz.newPackage$("java.lang.management");
Clazz.newPackage$("java.lang.reflect");
Clazz.newPackage$("java.lang.ref");
java.lang.ref.reflect = java.lang.reflect;
Clazz.newPackage$("java.util");
Clazz.newPackage$("java.security");


Clazz.newInterface$ (java.io,"Closeable");
Clazz.newInterface$ (java.io,"DataInput");
Clazz.newInterface$ (java.io,"DataOutput");
Clazz.newInterface$ (java.io,"Externalizable");
Clazz.newInterface$ (java.io,"Flushable");
Clazz.newInterface$ (java.io,"Serializable");
Clazz.newInterface$ (java.lang,"Iterable");
Clazz.newInterface$ (java.lang,"CharSequence");
Clazz.newInterface$ (java.lang,"Cloneable");
Clazz.newInterface$ (java.lang,"Appendable");
Clazz.newInterface$ (java.lang,"Comparable");
Clazz.newInterface$ (java.lang,"Runnable");
Clazz.newInterface$ (java.util,"Comparator");

//////// (int) conversions //////////

// deprecated
Clazz.doubleToInt = Clazz.floatToInt = function (x) {
  // asm.js-style conversion
  return x|0;
};


///////////////////////////////// Array additions //////////////////////////////
//
// BH: these are necessary for integer processing, especially
//
//

var arraySlice = function(istart, iend) {
  // could be Safari or could be fake
  istart || (istart = 0);
  iend || (iend = this.length);
  var b = new this.constructor(this.buffer.slice(istart * this.__BYTESIZE, iend * this.__BYTESIZE));
  b.__BYTESIZE = a.__BYTESIZE;
  b.__ARRAYTYPE = a.__ARRAYTYPE;
};

var setAType = function (IntXArray, nBytes, atype) {
  if (!IntXArray)
    alert("SwingJS will not work in this Browser")
  if (!IntXArray.prototype.sort)
    IntXArray.prototype.sort = Array.prototype.sort
  if (!IntXArray.prototype.slice)
    IntXArray.prototype.slice = function() {return arraySlice.apply(this, arguments)};
  IntXArray.prototype.clone = function() {
    var a = this.slice(); 
    a.__BYTESIZE = 1;
    a.__ARRAYTYPE = this.__ARRAYTYPE; 
    return a; 
  };
}

setAType(Int8Array, 1, "BA");
setAType(Int16Array, 2, "HA");
setAType(Int32Array, 4, "IA");
setAType(Float64Array, 8, "DA");

java.lang.Object = Clazz._O;

Clazz._O.getName = inF.getName;

Clazz._declared = {}
Clazz._setDeclared = function(name, func) {
   Clazz.allClasses[name] = func;
   Clazz.setGlobal(name, func);
}

//////////////////////////// hotspot and unloading ////////////////////

// not implemented in SwingJS

//////////////////////////// class loader /////////////////////////////

/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create July 10, 2006
 *******/

// see notes in j2s/classLoader.txt

//if (window["ClazzNode"] == null) {
/**
 * TODO:
 * Make optimization over class dependency tree.
 */


/**
 * Class dependency tree node
 */
/* private */
var Node = function () {
  this.parents = [];
  this.musts = [];
  this.optionals = [];
  this.declaration = null;
  this.name = null; // id
  this.path = null;
//  this.requires = null;
//  this.requiresMap = null;
  this.onLoaded = null;
  this.status = 0;
  this.random = 0.13412;
};


/**
 * Static class loader class
 */
Clazz._Loader = Clazz.ClazzLoader = function () {};

;(function(Clazz, _Loader) {

ClassLoader = java.lang.ClassLoader = _Loader;
_Loader.__CLASS_NAME__ = "ClassLoader";
Clazz.allClasses["java.lang.ClassLoader"] = _Loader;
_Loader.sysLoader = null;

_Loader.getSystemClassLoader = function() {
  return (_Loader.sysLoader ? _Loader.sysLoader : (_Loader.sysLoader = new Class().getClassLoader()));
};

_Loader.prototype.setDefaultAssertionStatus$Z = function(tf) {
  Clazz.defaultAssertionStatus = tf;
};

var assertionStatus = {};

_Loader.prototype.clearAssertionStatus = function() {
  assertionStatus = {};
  Clazz.defaultAssertionStatus = false;
}

_Loader.$getClassAssertionStatus = function(clazz) {
  var ret;
  var clazzName = clazz.__CLASS_NAME__ + ".";
  for (var c in assertionStatus) {
    if (clazzName.indexOf(c) == 0) {
      ret = assertionStatus[c];
      break;
    }
  }
  return (ret === false ? false : ret || Clazz.defaultAssertionStatus);
}

_Loader.prototype.setClassAssertionStatus$S$Z = _Loader.prototype.setPackageAssertionStatus$S$Z = function(clazzName, tf) {
  if (Clazz.allClasses[clazzName])Clazz.allClasses[clazzName].$_ASSERT_ENABLED_ = tf;
  assertionStatus[clazzName + "."] = tf;
};

_Loader.prototype.loadClass$S = function(clazzName) {
  return Clazz._4Name(clazzName);
}
_Loader._checkLoad = J2S._checkLoad;
 
_Loader._TODO = [];

_Loader.doTODO = function() {
  while (_Loader._TODO.length) {
   var f = _Loader._TODO.shift();
   f();
    }
}
 
_Loader.updateNodeForFunctionDecoration = function(qName) {

  var node = findNode(qName);
  if (node && node.status == Node.STATUS_KNOWN) {
    if (node.musts.length == 0 && node.optionals.length == 0) {
      var f = function() { updateNode(node) };
      _Loader._TODO.push(f);
    } else {
      window.setTimeout(f, 1); 
    }
  }
}

Node.prototype.toString = function() {
  return this.name || this.path || "ClazzNode";
}

Node.STATUS_UNKNOWN = 0;
Node.STATUS_KNOWN = 1;
Node.STATUS_CONTENT_LOADED = 2;
Node.STATUS_MUSTS_LOADED = 3;
Node.STATUS_DECLARED = 4;
Node.STATUS_LOAD_COMPLETE = 5;

             
var loaders = [];

/* public */
_Loader.requireLoaderByBase = function (base) {
  for (var i = 0; i < loaders.length; i++) {
    if (loaders[i].$_$base == base) {
      return loaders[i];
    }
  }
  var loader = new _Loader ();
  loader.$_$base = base; 
  loaders.push(loader);
  return loader;
};


/**
 * Class dependency tree
 * /
var clazzTreeRoot = new Node();

/**
 * Used to keep the status whether a given *.js path is loaded or not.
 * /
/* private * /
var loadedScripts = {};

/**
 * Multiple threads are used to speed up *.js loading.
 * /
/* private * /
var inLoadingThreads = 0;

/**
 * Maximum of loading threads
 */
/* private * /
var maxLoadingThreads = 6;

var userAgent = navigator.userAgent.toLowerCase ();
var isOpera = (userAgent.indexOf ("opera") != -1);
var isIE = (userAgent.indexOf ("msie") != -1) && !isOpera;
var isGecko = (userAgent.indexOf ("gecko") != -1);

/*
 * Opera has different loading order which will result in performance degrade!
 * So just return to single thread loading in Opera!
 *
 * FIXME: This different loading order also causes bugs in single thread!
 * /
if (isOpera) {
  maxLoadingThreads = 1;
  var index = userAgent.indexOf ("opera/");
  if (index != -1) {
    var verNumber = 9.0;
    try {
      verNumber = parseFloat(userAgent.subString (index + 6));
    } catch (e) {}
    if (verNumber >= 9.6) {
      maxLoadingThreads = 6;
    }
  } 
}
 */

/**
 * Try to be compatiable with Clazz system.
 * In original design _Loader and Clazz are independent!
 *  -- zhourenjian @ December 23, 2006
 */
var isClassdefined;
var definedClasses;

if (self.Clazz && Clazz.isClassDefined) {
  isClassDefined = Clazz.isClassDefined;
} else {
  definedClasses = {};
  isClassDefined = function (clazzName) {
    return definedClasses[clazzName] == true;
  };
}

/**
 * Used to keep to-be-loaded classes.
 */
/* private 
var classQueue = [];

/* private */
var classpathMap = Clazz.classpathMap = {};

/* private 
var pkgRefCount = 0;
*/

/* public */
_Loader.loadPackageClasspath = function (pkg, base, isIndex, fSuccess, mode, pt) {
  var map = classpathMap;
  mode || (mode = 0);
  fSuccess || (fSuccess = null);
  pt || (pt = 0);

  /*
   * In some situation, maybe,
   * _Loader.packageClasspath ("java", ..., true);
   * is called after other _Loader#packageClasspath, e.g.
   * <code>
   * _Loader.packageClasspath ("org.eclipse.swt", "...", true);
   * _Loader.packageClasspath ("java", "...", true);
   * </code>
   * which is not recommended. But _Loader should try to adjust orders
   * which requires "java" to be declared before normal _Loader
   * #packageClasspath call before that line! And later that line
   * should never initialize "java/package.js" again!
   */
  var isPkgDeclared = (isIndex && map["@" + pkg]);
  if (mode == 0 && isIndex && !map["@java"] && pkg.indexOf ("java") != 0 && needPackage("java")) {
    _Loader.loadPackage("java", fSuccess ? function(_package){_Loader.loadPackageClasspath(pkg, base, isIndex, fSuccess, 1)} : null);
    if (fSuccess)
      return;
  }
  if (pkg instanceof Array) {
    unwrapArray(pkg);
    if (fSuccess) {
      if (pt < pkg.length)
        _Loader.loadPackageClasspath(pkg[pt], base, isIndex, function(_loadPackageClassPath){_Loader.loadPackageClasspath(pkg, base, isIndex, fSuccess, 1, pt + 1)}, 1);
      else
        fSuccess();
    } else {
      for (var i = 0; i < pkg.length; i++)
        _Loader.loadPackageClasspath(pkg[i], base, isIndex, null);
    }
    return;
  }
  switch (pkg) {
  case "java.*":
    pkg = "java";
    // fall through
  case "java":
    if (base) {
      // support ajax for default
      var key = "@net.sf.j2s.ajax";
      if (!map[key])
        map[key] = base;
      key = "@net.sf.j2s";
      if (!map[key])
        map[key] = base;
    }    
    break;
  case "swt":
    pkg = "org.eclipse.swt";
    break;
  case "ajax":
    pkg = "net.sf.j2s.ajax";
    break;
  case "j2s":
    pkg = "net.sf.j2s";
    break;
  default:
    if (pkg.lastIndexOf(".*") == pkg.length - 2)
      pkg = pkg.substring(0, pkg.length - 2);
    break;
  }
  if (base) // critical for multiple applets
    map["@" + pkg] = base;
  if (isIndex && !isPkgDeclared && !window[pkg + ".registered"]) {
    //pkgRefCount++;
    if (pkg == "java")
      pkg = "core" // JSmol -- moves java/package.js to core/package.js
    _Loader.loadClass(pkg + ".package", function () {
          //if (--pkgRefCount == 0)
            //runtimeLoaded();
          //fSuccess && fSuccess();
        }, true, true, 1);
    return;
  }
  fSuccess && fSuccess();
};

/**
 * BH: allows user/developer to load classes even though wrapping and Google
 * Closure Compiler has not been run on the class.
 * 
 *   
 *   
 */
Clazz.loadClass = function (name, onLoaded, async) {
  if (!self.Class) {
    Class = Clazz;
    Class.forName = Clazz._4Name;
    // maybe more here
  }
  if (!name)
    return null;
  if (!async)
    return Clazz.load(name);   
  _Loader.loadClass(name, function() {
    var cl = Clazz.allClasses[name];
    cl && cl.$load$ && cl.$load$();
    onLoaded(cl);
  }, true, async, 1);
  return true;

}

/**
 * Load the given class ant its related classes.
 */
/* public */
_Loader.loadClass = _Loader.prototype.loadClass = function (name, onLoaded, forced, async, mode) {

  mode || (mode = 0); // BH: not implemented
  (async == null) && (async = false);
  
   if (typeof onLoaded == "boolean")
    return evalType(name);

  System.out.println("loadClass " + name)
  var path = _Loader.getClasspathFor(name);

    loadScript$(path);//(n, n.path, n.requiredBy, false, onLoaded ? function(_loadClass){ isLoadingEntryClass = bSave; onLoaded()}: null);
}

/* private */
_Loader.loadPackage = function(pkg, fSuccess) {
  fSuccess || (fSuccess = null);
  window[pkg + ".registered"] = false;
  _Loader.loadPackageClasspath(pkg, 
    (_Loader.J2SLibBase || (_Loader.J2SLibBase = (_Loader.getJ2SLibBase() || "j2s/"))), 
    true, fSuccess);
};

/**
 * Register classes to a given *.z.js path, so only a single *.z.js is loaded
 * for all those classes.
 */
/* public */
_Loader.jarClasspath = function (jar, clazzes) {
  if (!(clazzes instanceof Array))
    clazzes = [clazzes];
  unwrapArray(clazzes);
  if (J2S._debugCore)
    jar = jar.replace(/\.z\./, ".")
  for (var i = clazzes.length; --i >= 0;) {
    clazzes[i] = clazzes[i].replace(/\//g,".").replace(/\.js$/g,"")
    classpathMap["#" + clazzes[i]] = jar;
  }
  classpathMap["$" + jar] = clazzes;
};

_Loader.setClasspathFor = function(clazzes) {
//   Clazz._Loader.setClasspathFor("edu/colorado/phet/idealgas/model/PressureSensingBox.ChangeListener");
  if (!(clazzes instanceof Array))
    clazzes = [clazzes];
    for (var i = clazzes.length; --i >= 0;) {
      path = clazzes[i];
      var jar = _Loader.getJ2SLibBase() + path.split(".")[0]+".js";
      path = path.replace(/\//g,".");
      classpathMap["#" + path] = jar;
      var a = classpathMap["$" + jar] || (classpathMap["$" + jar] = []);
      a.push(path);
    }
}


/**
 * Usually be used in .../package.js. All given packages will be registered
 * to the same classpath of given prefix package.
 */
/* public */
_Loader.registerPackages = function (prefix, pkgs) {
  //_Loader.checkInteractive ();
  var base = _Loader.getClasspathFor (prefix + ".*", true);
  for (var i = 0; i < pkgs.length; i++) {
    if (window["Clazz"]) {
      Clazz.newPackage$(prefix + "." + pkgs[i]);
    }
    _Loader.loadPackageClasspath (prefix + "." + pkgs[i], base);
  }
};

/**
 * Return the *.js path of the given class. Maybe the class is contained
 * in a *.z.js jar file.
 * @param clazz Given class that the path is to be calculated for. May
 * be java.package, or java.lang.String
 * @param forRoot Optional argument, if true, the return path will be root
 * of the given classs' package root path.
 * @param ext Optional argument, if given, it will replace the default ".js"
 * extension.
 */
/* public */
_Loader.getClasspathFor = function (clazz, forRoot, ext) {
  var path = classpathMap["#" + clazz];
  if (!path || forRoot || ext) {
    var base;
    var idx;
    if (path) {
      clazz = clazz.replace(/\./g, "/");  
      if ((idx = path.lastIndexOf(clazz)) >= 0 
        || (idx = clazz.lastIndexOf("/")) >= 0 
          && (idx = path.lastIndexOf(clazz.substring(0, idx))) >= 0)
        base = path.substring(0, idx);
    } else {
      idx = clazz.length + 2;
      while ((idx = clazz.lastIndexOf(".", idx - 2)) >= 0)
        if ((base = classpathMap["@" + clazz.substring(0, idx)]))
          break;
      if (!forRoot)
        clazz = clazz.replace (/\./g, "/");  
    }
    if (base == null) {
      var bins = "binaryFolders";
      base = (window["Clazz"] && Clazz[bins] && Clazz[bins].length ? Clazz[bins][0] 
        : _Loader[bins]  && _Loader[bins].length ? _Loader[bins][0]
        : "j2s");
    }
    path = (base.lastIndexOf("/") == base.length - 1 ? base : base + "/") + (forRoot ? ""
      : clazz.lastIndexOf("/*") == clazz.length - 2 ? clazz.substring(0, idx + 1)
      : clazz + (!ext ? ".js" : ext.charAt(0) != '.' ? "." + ext : ext));
  }    
  return path;//_Loader.multipleSites(path);
};

/**
 * page-customizable callbacks
 *
 */
/* public */
_Loader.onScriptLoading = function (file){window.console.log("onscriptload " + file);};

/* public */
_Loader.onScriptLoaded = function (file, isError){};

/* public */
_Loader.onScriptInitialized = function (file){}; // not implemented

/* public */
_Loader.onScriptCompleted = function (file){}; // not implemented

/* public */
_Loader.onClassUnloaded = function (clazz){}; // not implemented

/* private */
var isClassExcluded = function (clazz) {
  return excludeClassMap["@" + clazz];
};

/* Used to keep ignored classes */
/* private */
var excludeClassMap = {};

Clazz._lastEvalError = null;

/* private */
var evaluate = function(file, js) {
  try {
    eval(js + ";//# sourceURL="+file);
  } catch (e) {      
    var s = "[Java2Script] The required class file \n\n" + file + (js.indexOf("data: no") ? 
       "\nwas not found.\n"
      : "\ncould not be loaded. Script error: " + e.message + " \n\ndata:\n\n" + js) + "\n\n" 
      + (e.stack ? e.stack : Clazz.getStackTrace());
    Clazz._lastEvalError = s;    
    if (Clazz._isQuiet) 
      return;
    Clazz.alert(s);
    throw e;
  }
}

/* private 
var generateRemovingFunction = function (node) {
  return function () {
    if (node.readyState != "interactive") {
      try {
        if (node.parentNode)
          node.parentNode.removeChild (node);
      } catch (e) { }
      node = null;
    }
  };
};
*/
/* private 
var removeScriptNode = function (n) {
  if (window["j2s.script.debugging"]) {
    return;
  }
  // lazily remove script nodes.
  window.setTimeout (generateRemovingFunction (n), 1);
};
*/

/* public */
Clazz._4Name = function(clazzName, applet, state, asClazz) {
    if (clazzName.indexOf(".") < 0)
      clazzName = "java.lang." + clazzName;  
  var isok = Clazz.isClassDefined(clazzName);
  if (isok && asClazz) {
    var cl = Clazz.allClasses[clazzName];
    cl.$clinit$ && cl.$clinit$();
    return cl;
  } 
  if (!isok) {
    var name2 = null;
    if (clazzName.indexOf("$") >= 0) {
      // BH we allow Java's java.swing.JTable.$BooleanRenderer as a stand-in for java.swing.JTable.BooleanRenderer
      // when the static nested class is created using declareType  
      name2 = clazzName.replace(/\$/g,".");
      if (Clazz.isClassDefined(name2)) {
        clazzName = name2;
      } else {
        name2 = null;
      }
    }
    if (name2 == null) {
      var f = (J2S._isAsync && applet ? applet._restoreState(clazzName, state) : null);
      if (f == 1)
        return null; // must be already being created
      if (_Loader.setLoadingMode(f ? _Loader.MODE_SCRIPT : "xhr.sync")) {
        _Loader.loadClass(clazzName, f, false, true, 1);
        return null; // this will surely throw an error, but that is OK
      }
      //alert ("Using Java reflection: " + clazzName + " for " + applet._id + " \n"+ Clazz.getStackTrace());
      _Loader.loadClass(clazzName);
    }    
  }
  var cl = evalType(clazzName);
  if (!cl){
    alert(clazzName + " could not be loaded");
    debugger;
  }
  Clazz.allClasses[clazzName] = cl;
  cl.$clinit$ && cl.$clinit$();
  return (asClazz ? cl : Clazz.getClass(cl));
};

/**
 * BH: possibly useful for debugging
 */ 
Clazz.currentPath= "";


var loadScript$ = function(file) {

  Clazz.currentPath = file;
  //loadedScripts[file] = true;
  // also remove from queue
  //removeArrayItem(classQueue, file);

  var file0 = file;
  if (Clazz._debugging) {
    file = file.replace(/\.z\.js/,".js");
  }

  _Loader.onScriptLoading(file);

    var data = J2S._getFileData(file);
    try{
      evaluate(file, data);
      _Loader.onScriptLoaded(file, false);
    }catch(e) {
      _Loader.onScriptLoaded(file, e);
      var s = ""+e;
      if (data.indexOf("Error") >= 0)
        s = data;
      if (s.indexOf("missing ] after element list")>= 0)
        s = "File not found";
      doDebugger()
      alert(s + " loading file " + file);
    }
    
  return;
}

/**
 * Used in package
/* public */
var runtimeKeyClass = _Loader.runtimeKeyClass = "java.lang.String";

/**
 * Queue used to store classes before key class is loaded.
 */
/* private 
var queueBe4KeyClazz = [];

/* private */
var J2sLibBase;

/**
 * Return J2SLib base path from existed SCRIPT src attribute.
 */
/* public */
_Loader.getJ2SLibBase = function () {
  var o = window["j2s.lib"];
  return (o ? o.base + (o.alias == "." ? "" : (o.alias ? o.alias : (o.version ? o.version : "1.0.0")) + "/") : null);
};

/**
 * Indicate whether _Loader is loading script synchronously or 
 * asynchronously.
 */
/* private */
var isAsynchronousLoading = true;

/* private */
var isUsingXMLHttpRequest = false;

/* private */
var loadingTimeLag = -1;

_Loader.MODE_SCRIPT = 4;
_Loader.MODE_XHR = 2;
_Loader.MODE_SYNC = 1;

/**
 * String mode:
 * asynchronous modes:
 * async(...).script, async(...).xhr, async(...).xmlhttprequest,
 * script.async(...), xhr.async(...), xmlhttprequest.async(...),
 * script
 * 
 * synchronous modes:
 * sync(...).xhr, sync(...).xmlhttprequest,
 * xhr.sync(...), xmlhttprequest.sync(...),
 * xmlhttprequest, xhr
 *                                                    
 * Integer mode:
 * Script 4; XHR 2; SYNC bit 1; 
 */
/* public */
_Loader.setLoadingMode = function (mode, timeLag) {
  var async = true;
  var ajax = true;
  if (typeof mode == "string") {
    mode = mode.toLowerCase();
    if (mode.indexOf("script") >= 0)
      ajax = false;
    else
      async = (mode.indexOf("async") >=0);
    async = false; // BH
  } else {
    if (mode & _Loader.MODE_SCRIPT)
      ajax = false;
    else
      async = !(mode & _Loader.MODE_SYNC);
  }
  isUsingXMLHttpRequest = ajax;
  isAsynchronousLoading = async;
  loadingTimeLag = (async && timeLag >= 0 ? timeLag: -1);
  return async;
};

/*
 * Load those key *.z.js. This *.z.js will be surely loaded before other 
 * queued *.js.
 */
/* public */
_Loader.loadZJar = function (zjarPath, keyClass) {
// used only by package.js for core.z.js
  var f =  null;
  var isArr = (keyClass instanceof Array);
  if (isArr)
    keyClass = keyClass[keyClass.length - 1];
//  else
  //  f = (keyClass == runtimeKeyClass ? runtimeLoaded : null);      
  _Loader.jarClasspath(zjarPath, isArr ? keyClass : [keyClass]);
  // BH note: runtimeKeyClass is java.lang.String  
  _Loader.loadClass(keyClass, null, true);
};

Clazz.binaryFolders =  _Loader.binaryFolders = [ _Loader.getJ2SLibBase() ];

})(Clazz, Clazz._Loader);

//}
/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Jan 11, 2007
 *******/

Clazz._LoaderProgressMonitor = {};

;(function(CLPM, J2S) {

var fadeOutTimer = null;
var fadeAlpha = 0;
var monitorEl = null;
var lastScrollTop = 0;
var bindingParent = null;

CLPM.DEFAULT_OPACITY = (J2S && J2S._j2sLoadMonitorOpacity ? J2S._j2sLoadMonitorOpacity : 55);

/* public */
CLPM.hideMonitor = function () {
    monitorEl.style.display = "none";
}

/* public */
CLPM.showStatus = function (msg, fading) {
  if (!monitorEl) {
    createHandle ();
    if (!attached) {
      attached = true;
      //Clazz.addEvent (window, "unload", cleanup);
      // window.attachEvent ("onunload", cleanup);
    }
  }
  clearChildren(monitorEl);
  if (msg == null) {
    if (fading) {
      fadeOut();
    } else {
      CLPM.hideMonitor();
    }
    return;
  }
  
  monitorEl.appendChild(document.createTextNode ("" + msg));
  if (monitorEl.style.display == "none") {
    monitorEl.style.display = "";
  }
  setAlpha(CLPM.DEFAULT_OPACITY);
  var offTop = getFixedOffsetTop();
  if (lastScrollTop != offTop) {
    lastScrollTop = offTop;
    monitorEl.style.bottom = (lastScrollTop + 4) + "px";
  }
  if (fading) {
    fadeOut();
  }
};

/* private static */ 
var clearChildren = function (el) {
  if (!el)
    return;
  for (var i = el.childNodes.length; --i >= 0;) {
    var child = el.childNodes[i];
    if (!child)
      continue;
    if (child.childNodes && child.childNodes.length)
      clearChildren (child);
    try {
      el.removeChild (child);
    } catch (e) {};
  }
};
/* private */ 
var setAlpha = function (alpha) {
  if (fadeOutTimer && alpha == CLPM.DEFAULT_OPACITY) {
    window.clearTimeout (fadeOutTimer);
    fadeOutTimer = null;
  }
  fadeAlpha = alpha;
  var ua = navigator.userAgent.toLowerCase();
  monitorEl.style.filter = "Alpha(Opacity=" + alpha + ")";
  monitorEl.style.opacity = alpha / 100.0;
};
/* private */ 
var hidingOnMouseOver = function () {
  CLPM.hideMonitor();
};

/* private */ 
var attached = false;
/* private */ 
var cleanup = function () {
  //if (monitorEl) {
  //  monitorEl.onmouseover = null;
  //}
  monitorEl = null;
  bindingParent = null;
  //Clazz.removeEvent (window, "unload", cleanup);
  //window.detachEvent ("onunload", cleanup);
  attached = false;
};
/* private */ 
var createHandle = function () {
  var div = document.createElement ("DIV");
  div.id = "_Loader-status";
  div.style.cssText = "position:absolute;bottom:4px;left:4px;padding:2px 8px;"
      + "z-index:" + (window["j2s.lib"].monitorZIndex || 10000) + ";background-color:#8e0000;color:yellow;" 
      + "font-family:Arial, sans-serif;font-size:10pt;white-space:nowrap;";
  div.onmouseover = hidingOnMouseOver;
  monitorEl = div;
  if (bindingParent) {
    bindingParent.appendChild(div);
  } else {
    document.body.appendChild(div);
  }
  return div;
};
/* private */ 

var fadeOut = function () {
  if (monitorEl.style.display == "none") return;
  if (fadeAlpha == CLPM.DEFAULT_OPACITY) {
    fadeOutTimer = window.setTimeout(function () {
          fadeOut();
        }, 750);
    fadeAlpha -= 5;
  } else if (fadeAlpha - 10 >= 0) {
    setAlpha(fadeAlpha - 10);
    fadeOutTimer = window.setTimeout(function () {
          fadeOut();
        }, 40);
  } else {
    monitorEl.style.display = "none";
  }
};
/* private */
var getFixedOffsetTop = function (){
  if (bindingParent) {
    var b = bindingParent;
    return b.scrollTop;
  }
  var dua = navigator.userAgent;
  var b = document.body;
  var p = b.parentNode;
  var pcHeight = p.clientHeight;
  var bcScrollTop = b.scrollTop + b.offsetTop;
  var pcScrollTop = p.scrollTop + p.offsetTop;
  return (dua.indexOf("Opera") < 0 && document.all ? (pcHeight == 0 ? bcScrollTop : pcScrollTop)
    : dua.indexOf("Gecko") < 0 ? (pcHeight == p.offsetHeight 
        && pcHeight == p.scrollHeight ? bcScrollTop : pcScrollTop) : bcScrollTop);
};

/* not used in Jmol
if (window["ClazzLoader"]) {
  _Loader.onScriptLoading = function(file) {
    CLPM.showStatus("Loading " + file + "...");
  };
  _Loader.onScriptLoaded = function(file, isError) {
    CLPM.showStatus(file + (isError ? " loading failed." : " loaded."), true);
  };
  _Loader.onGlobalLoaded = function(file) {
    CLPM.showStatus("Application loaded.", true);
  };
  _Loader.onClassUnloaded = function(clazz) {
    CLPM.showStatus("Class " + clazz + " is unloaded.", true);
  };
}
*/

})(Clazz._LoaderProgressMonitor, J2S);

//}
/******************************************************************************
 * Copyright (c) 2007 java2script.org and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Zhou Renjian - initial API and implementation
 *****************************************************************************/
/*******
 * @author zhou renjian
 * @create Nov 5, 2005
 *******/

Clazz.Console = {};

;(function(Con) {
/**
 * Setting maxTotalLines to -1 will not limit the console result
 */
Con.maxTotalLines =  10000;

Con.setMaxTotalLines = function (lines) {
  Con.maxTotalLines = (lines > 0 ? lines : 999999);
}

Con.maxLatency = 40;

Con.setMaxLatency = function (latency) {
  Con.maxLatency = (latency > 0 ? latency : 40);
};

Con.pinning  = false;

Con.enablePinning = function (enabled) {
  Con.pinning = enabled;
};

Con.linesCount = 0;

Con.metLineBreak = false;


/*
 * Give an extension point so external script can create and bind the console
 * themself.
 *
 * TODO: provide more template of binding console window to browser.
 */
/* protected */
Con.createConsoleWindow = function (parentEl) {
  var console = document.createElement ("DIV");
  console.style.cssText = "font-family:monospace, Arial, sans-serif;";
  document.body.appendChild (console);
  return console;
};

var c160 = String.fromCharCode(160); //nbsp;
c160 += c160+c160+c160;

Con.consoleOutput = function (s, color) {
  var o = window["j2s.lib"];
  var con = (o && o.console);
  if (!con) {
    return false; // BH this just means we have turned off all console action
  }
  if (con == window.console) {
    if (color == "red")
      con.err(s);
    else
      con.log(s);
    return;
  }
  if (con && typeof con == "string")
    con = document.getElementById(con)
  if (Con.linesCount > Con.maxTotalLines) {
    for (var i = 0; i < Con.linesCount - Con.maxTotalLines; i++) {
      if (con && con.childNodes.length > 0) {
        con.removeChild (con.childNodes[0]);
      }
    }
    Con.linesCount = Con.maxTotalLines;
  }

  var willMeetLineBreak = false;
  s = (typeof s == "undefined" ? "" : s == null ? "null" : "" + s);
  s = s.replace (/\t/g, c160);
  if (s.length > 0)
    switch (s.charAt(s.length - 1)) {
    case '\n':
    case '\r':
      s = (s.length > 1 ? s.substring (0, s.length - (s.charAt (s.length - 2) == '\r' ? 2 : 1)) : "");
      willMeetLineBreak = true;
      break;
    }

  var lines = null;
  s = s.replace (/\t/g, c160);
  lines = s.split(/\r\n|\r|\n/g);
  for (var i = 0, last = lines.length - 1; i <= last; i++) {
    var lastLineEl = null;
    if (Con.metLineBreak || Con.linesCount == 0 
        || con.childNodes.length < 1) {
      lastLineEl = document.createElement ("DIV");
      con.appendChild (lastLineEl);
      lastLineEl.style.whiteSpace = "nowrap";
      Con.linesCount++;
    } else {
      try {
        lastLineEl = con.childNodes[con.childNodes.length - 1];
      } catch (e) {
        lastLineEl = document.createElement ("DIV");
        con.appendChild (lastLineEl);
        lastLineEl.style.whiteSpace = "nowrap";
        Con.linesCount++;
      }
    }
    var el = document.createElement ("SPAN");
    lastLineEl.appendChild (el);
    el.style.whiteSpace = "nowrap";
    if (color)
      el.style.color = color;
    var l = lines[i]
    if (l.length == 0)
      l = c160;
    el.appendChild(document.createTextNode(l));
    if (!Con.pinning)
      con.scrollTop += 100;
    Con.metLineBreak = (i != last || willMeetLineBreak);
  }

  var cssClazzName = con.parentNode.className;
  if (!Con.pinning && cssClazzName
      && cssClazzName.indexOf ("composite") != -1) {
    con.parentNode.scrollTop = con.parentNode.scrollHeight;
  }
  Con.lastOutputTime = new Date ().getTime ();
};

/*
 * Clear all contents inside the console.
 */
/* public */
Con.clear = function () {
  try {
    Con.metLineBreak = true;
    var o = window["j2s.lib"];
    var console = o && o.console;
    if (!console || !(console = document.getElementById (console)))
      return;
    var childNodes = console.childNodes;
    for (var i = childNodes.length; --i >= 0;)
      console.removeChild (childNodes[i]);
    Con.linesCount = 0;
  } catch(e){};
};

/* public */
Clazz.alert = function (s) {
  Con.consoleOutput (s + "\r\n");
};

})(Clazz.Console);



Clazz._setDeclared("java.lang.System",
java.lang.System = System = {
  props : null, //new java.util.Properties (),
  $props : {},
  arraycopy : function (src, srcPos, dest, destPos, length) {  
    if (src !== dest || srcPos > destPos) {
      for (var i = length; --i >= 0;)
        dest[destPos++] = src[srcPos++];
    } else {
      destPos += length;
      srcPos += length;
      for (var i = length; --i >= 0;)
        src[--destPos] = src[--srcPos];
    }
  },
  
  currentTimeMillis : function () {
    return new Date ().getTime ();
  },
  exit : function() { swingjs.JSToolkit && swingjs.JSToolkit.exit() },
  gc : function() {}, // bh
  getProperties : function () {
    return System.props;
  },
  getProperty : function (key, def) {
    if (System.props)
      return System.props.getProperty$S$S (key, def);
    var v = System.$props[key];
    if (typeof v != "undefined")
      return v;
    if (key.indexOf(".") > 0) {
      v = null;    
      switch (key) {
      case "java.class.version":
        v = "50";
        break;
      case "java.version":
        v = "1.6";
        break;
      case "file.separator":
      case "path.separator":
        v = "/";
        break;        
      case "line.separator":
        v = (navigator.userAgent.indexOf("Windows") >= 0 ? "\r\n" : "\n");
        break;
      case "os.name":
      case "os.version":
        v = navigator.userAgent;
        break;
      }
      if (v)
        return System.$props[key] = v;
    }
    return (arguments.length == 1 ? null : def == null ? key : def); // BH
  },
  getSecurityManager : function() { return null },  // bh
  identityHashCode : function(obj){return obj==null ? 0 : obj._$hashcode || (obj._$hashcode = ++hashCode)},
  lineSeparator : function() { return '\n' }, // bh
  nanoTime: function() {
   return Math.round(window.performance.now() * 1e6)
  },  
  setProperties : function (props) {
    System.props = props;
  },
  setProperty : function (key, val) {
    if (!System.props)
      return System.$props[key] = val; // BH
    System.props.setProperty (key, val);
  }
  
});

;(function(Con, Sys) {

Sys.out = new Clazz._O ();
Sys.out.__CLASS_NAME__ = "java.io.PrintStream";


Sys.out.print = Sys.out.print$S = function (s) { 
  Con.consoleOutput (s);
};

Sys.out.printf = Sys.out.printf$S$OA = Sys.out.format = Sys.out.format$S$OA = function (f, args) {
  Sys.out.print(String.format.apply(null, arguments));
}

Sys.out.println = Sys.out.println$O = Sys.out.println$Z = Sys.out.println$I = Sys.out.println$S = Sys.out.println$C = Sys.out.println = function(s) {

if (("" + s).indexOf("TypeError") >= 0) {
   debugger;
}
  if (Clazz._nooutput) return;
  if (Clazz._traceOutput && s && ("" + s).indexOf(Clazz._traceOutput) >= 0) {
    alert(s + "\n\n" + Clazz.getStackTrace());
    debugger;
  }
  Con.consoleOutput(typeof s == "undefined" ? "\r\n" : s == null ?  s = "null\r\n" : s + "\r\n");
};

Sys.out.println$F = Sys.out.println$D = function(f) {var s = "" + f; Sys.out.println(s.indexOf(".") < 0 && s.indexOf("Inf") < 0 ? s + ".0" : s)};

Sys.out.write = function (buf, offset, len) {
  Sys.out.print(String.instantialize(buf).substring(offset, offset+len));
};

Sys.err = new Clazz._O ();
Sys.err.__CLASS_NAME__ = "java.io.PrintStream";

Sys.err.print = function (s) { 
  Con.consoleOutput (s, "red");
};

Sys.err.printf = Sys.err.printf$S$OA = Sys.err.format = Sys.err.format$S$OA = Sys.err.format = function (f, args) {
  Sys.out.print(String.format.apply(null, arguments));
}

Sys.err.println = Sys.err.println$O = Sys.err.println$Z = Sys.err.println$I = Sys.err.println$S = Sys.err.println$C = Sys.err.println = function (s) {
  Con.consoleOutput (typeof s == "undefined" ? "\r\n" : s == null ?  s = "null\r\n" : s + "\r\n", "red");
};

Sys.err.println$F = Sys.err.println$D = function(f) {var s = "" + f; Sys.err.println(s.indexOf(".") < 0  && s.indexOf("Inf") < 0 ? s + ".0" : s)};

Sys.err.write = function (buf, offset, len) {
  Sys.err.print(String.instantialize(buf).substring(offset, offset+len));
};

})(Clazz.Console, System);


Clazz._Loader.registerPackages("java", [ "io", "lang", "lang.reflect", "util" ]);


if (!window["java.registered"])
 window["java.registered"] = false;

(function (ClazzLoader) {

  if (window["java.packaged"]) return;
  window["java.packaged"] = true;

  //if (!J2S._isAsync) {
    for (var i = 0; i < J2S._coreFiles.length; i++)
      ClazzLoader.loadZJar(J2S._coreFiles[i], ClazzLoader.runtimeKeyClass);
  //}
    

}) (Clazz._Loader);
window["java.registered"] = true;
  
///////////////// special definitions of standard Java class methods ///////////

var C$, m$ = Clazz.newMethod$;

Clazz._setDeclared("java.lang.Math", java.lang.Math = Math);

Math.rint || (Math.rint = function(a) {
 var b;
 return Math.round(a) + ((b = a % 1) != 0.5 && b != -0.5 ? 0 : (b = Math.round(a % 2)) > 0 ? b - 2 : b);
});

Math.log10||(Math.log10=function(a){return Math.log(a)/Math.E});

Math.hypot||(Math.hypot=function(x,y){return Math.sqrt(Math.pow(x,2)+Math.pow(y,2))});

Math.toDegrees||(Math.toDegrees=function(angrad){return angrad*180.0/Math.PI;});

Math.toRadians||(Math.toRadians=function(angdeg){return angdeg/180.0*Math.PI});

Math.copySign||(Math.copySign=function(mag,sign){return((sign>0?1:-1)*Math.abs(mag))});

//could use Math.sign(), but this was used to preserve cross-brower compatability (not in Internet Explorer)
Math.signum||(Math.signum=function(d){return(d==0.0||isNaN(d))?d:d < 0 ? -1 : 1});

Math.scalb||(Math.scalb=function(d,scaleFactor){return d*Math.pow(2,scaleFactor)});

//the following Math functions rely on datatypes nonexistant in javascript
Math.nextAfter||(Math.nextAfter=function(start,direction){return 0});
Math.nextUp||(Math.nextUp=function(d){return 0});
Math.ulp||(Math.ulp=function(d){return 0});
Math.getExponent||(Math.getExponent=function(d){return 0});
Math.getIEEEremainder||(Math.getIEEEremainder=function(f1,f2){return 0});
//end datatype reliant math declarations

Clazz._setDeclared("java.lang.Number", java.lang.Number=Number);
Number.prototype._numberToString=Number.prototype.toString;
if(supportsNativeObject){
  // Number and Array are special -- do not override prototype.toString -- "length - 2" here
  extendObject(Array);
  extendObject(Number);
}
Number.__CLASS_NAME__="Number";
implementOf(Number,java.io.Serializable);
Number.equals=Clazz._inF.equals;
Number.getName=Clazz._inF.getName;
Number.prototype.compareTo = function(x) { var a = this.valueOf(), b = x.valueOf(); return (a < b ? -1 : a == b ? 0 : 1) };
Number.compare = function(a,b) { return (a < b ? -1 : a == b ? 0 : 1) };

var $b$ = new Int8Array(1);
var $s$ = new Int16Array(1);
var $i$ = new Int32Array(1);

m$(Number,"shortValue",
function(){
return ($s$[0] = this, $s$[0]);
});

m$(Number,"byteValue",
function(){
return ($b$[0] = this, $b$[0]);
});


m$(Number,"intValue",
function(){
return ($i$[0] = this, $i$[0]);
});

m$(Number,"longValue",
function(){
return (this|0);
});

m$(Number,"floatValue",
function(){
return this.valueOf();
});
m$(Number,"doubleValue",
function(){
return this.valueOf();
});

m$(Number,"hashCode",
function(){
return this.valueOf();
});

Clazz._setDeclared("java.lang.Integer", java.lang.Integer=Integer=function(){
if (typeof arguments[0] != "object")this.c$(arguments[0]);
});

var setJ2STypeclass = function(cl, type, paramCode) {
// TODO -- should be a proper Java.lang.Class
  cl.TYPE = {
    isPrimitive: function() { return true },
    type:type, 
    __PARAMCODE:paramCode, 
    __PRIMITIVE:1  // referenced in java.lang.Class
  };
  cl.TYPE.toString = cl.TYPE.getName = cl.TYPE.getTypeName 
    = cl.TYPE.getCanonicalName = cl.TYPE.getSimpleName = function() {return type}
}

var decorateAsNumber = function (clazzFun, qClazzName, type, PARAMCODE) {
  clazzFun.prototype.valueOf=function(){return 0;};
  clazzFun.prototype.__VAL0__ = 1;
  extendJO(clazzFun, qClazzName, null, false, true);
  inheritClass(clazzFun, Number);
  implementOf(clazzFun, Comparable);
  setJ2STypeclass(clazzFun, type, PARAMCODE);
  return clazzFun;
};

decorateAsNumber(Integer, "Integer", "int", "I");

Integer.toString=Integer.prototype.toString=function(){
  if(arguments.length!=0){
    return "" + arguments[0];
  } 
  if(this===Integer){
    return "class java.lang.Integer";
  }
  return "" + this.valueOf();
};

m$(Integer, "c$", function(v){
 v == null && (v = 0);
 if (typeof v != "number")
  v = Integer.parseIntRadix(v, 10);
 v = v.intValue();  
 this.valueOf=function(){return v;};
}, 1);

Integer.MIN_VALUE=Integer.prototype.MIN_VALUE=-0x80000000;
Integer.MAX_VALUE=Integer.prototype.MAX_VALUE=0x7fffffff;
//Integer.TYPE=Integer.prototype.TYPE=Integer;


m$(Integer,"bitCount",
function(i) {
  i = i - ((i >>> 1) & 0x55555555);
  i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
  i = (i + (i >>> 4)) & 0x0f0f0f0f;
  i = i + (i >>> 8);
  i = i + (i >>> 16);
  return i & 0x3f;
});
Integer.bitCount=Integer.prototype.bitCount;

m$(Integer,"numberOfLeadingZeros",
function(i) {
 if (i == 0) return 32;
 var n = 1;
 if (i >>> 16 == 0) { n += 16; i <<= 16; }
 if (i >>> 24 == 0) { n +=  8; i <<=  8; }
 if (i >>> 28 == 0) { n +=  4; i <<=  4; }
 if (i >>> 30 == 0) { n +=  2; i <<=  2; }
 n -= i >>> 31;
 return n;
});
Integer.numberOfLeadingZeros=Integer.prototype.numberOfLeadingZeros;

m$(Integer,"numberOfTrailingZeros",
function(i) {
  if (i == 0) return 32;
  var n = 31;
  var y = i <<16; if (y != 0) { n = n -16; i = y; }
  y = i << 8; if (y != 0) { n = n - 8; i = y; }
  y = i << 4; if (y != 0) { n = n - 4; i = y; }
  y = i << 2; if (y != 0) { n = n - 2; i = y; }
  return n - ((i << 1) >>> 31);
});
Integer.numberOfTrailingZeros=Integer.prototype.numberOfTrailingZeros;

m$(Integer,"parseIntRadix",
function(s,radix){
if(s==null){
throw Clazz.new(NumberFormatException.c$$S, ["null"]);
}if(radix<2){
throw Clazz.new(NumberFormatException.c$$S, ["radix "+radix+" less than Character.MIN_RADIX (2)"]);
}if(radix>36){
throw Clazz.new(NumberFormatException.c$$S, ["radix "+radix+" greater than Character.MAX_RADIX (16)"]);
}
if (radix == 10) {
  for (var i = s.length; --i >= 0;) {
    var c = s.charCodeAt(i);
    if (c >= 48 && c <= 57) 
      continue;
    if (i > 0 || c != 43 && c != 45)
      throw Clazz.new(NumberFormatException.c$$S, ["Not a Number : "+s]);
  }
}
var i=parseInt(s,radix);
if(isNaN(i)){
throw Clazz.new(NumberFormatException.c$$S, ["Not a Number : "+s]);
}
return i;
});
Integer.parseIntRadix=Integer.prototype.parseIntRadix;

m$(Integer,"parseInt",
function(s){
return Integer.parseIntRadix(s,10);
});
Integer.parseInt=Integer.prototype.parseInt;

m$(Integer,"$valueOf",
function(s){
  return Clazz.new(Integer.c$, [s]);
});

Integer.$valueOf=Integer.prototype.$valueOf;

m$(Integer,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Integer)){
return false;
}
return s.valueOf()==this.valueOf();
});
m$(Integer,"equals$O",
function(s){
if(s==null||!Clazz.instanceOf(s,Integer)){
return false;
}
return s.valueOf()==this.valueOf();
});

Integer.toHexString=Integer.prototype.toHexString=function(d){
if(d.valueOf)d=d.valueOf();
if (d < 0) {
var b = d & 0xFFFFFF;
var c = ((d>>24)&0xFF);
return c._numberToString(16) + (b = "000000" + b._numberToString(16)).substring(b.length - 6);
}
return d._numberToString(16);};
Integer.toOctalString=Integer.prototype.toOctalString=function(d){if(d.valueOf)d=d.valueOf();return d._numberToString(8);};
Integer.toBinaryString=Integer.prototype.toBinaryString=function(d){if(d.valueOf)d=d.valueOf();return d._numberToString(2);};

m$(Integer,"decodeRaw", function(n){
if (n.indexOf(".") >= 0)n = "";
var i = (n.startsWith("-") ? 1 : 0);
n = n.replace(/\#/, "0x").toLowerCase();
var radix=(n.startsWith("0x", i) ? 16 : n.startsWith("0", i) ? 8 : 10);
// The general problem with parseInt is that is not strict -- ParseInt("10whatever") == 10.
// Number is strict, but Number("055") does not work, though ParseInt("055", 8) does.
// need to make sure negative numbers are negative
n = Number(n) & 0xFFFFFFFF;
return (radix == 8 ? parseInt(n, 8) : n);
}, 1);

m$(Integer,"decode", function(n){
  n = Integer.decodeRaw(n);
  if (isNaN(n) || n < Integer.MIN_VALUE|| n > Integer.MAX_VALUE)
  throw Clazz.new(NumberFormatException.c$$S,["Invalid Integer"]);
  return Clazz.new(Integer.c$, [n]);
}, 1);

m$(Integer,"hashCode",
function(){
return this.valueOf();
});

// Note that Long is problematic in JavaScript 

Clazz._setDeclared("java.lang.Long", java.lang.Long=Long=function(){
if (typeof arguments[0] != "object")this.c$(arguments[0]);
});

decorateAsNumber(Long, "Long", "long", "L");
Long.toString=Long.prototype.toString=function(){
if(arguments.length!=0){
return""+arguments[0];
}else if(this===Long){
return"class java.lang.Long";
}
return""+this.valueOf();
};

m$(Long, "c$", function(v){
  v == null && (v = 0);
  v = (typeof v == "number" ? Math.round(v) : Integer.parseIntRadix(v, 10));
  this.valueOf=function(){return v;};
}, 1);

//Long.MIN_VALUE=Long.prototype.MIN_VALUE=-0x8000000000000000;
//Long.MAX_VALUE=Long.prototype.MAX_VALUE=0x7fffffffffffffff;
//Long.TYPE=Long.prototype.TYPE=Long;

m$(Long,"parseLong",
function(s,radix){
 return Integer.parseInt(s, radix || 10);
});

Long.parseLong=Long.prototype.parseLong;

m$(Long,"$valueOf",
function(s){
return Clazz.new(Long.c$, [s]);
});

Long.$valueOf=Long.prototype.$valueOf;
m$(Long,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Long)){
return false;
}
return s.valueOf()==this.valueOf();
});
Long.$valueOf=Long.prototype.$valueOf;
m$(Long,"equals$O",
function(s){
if(s==null||!Clazz.instanceOf(s,Long)){
return false;
}
return s.valueOf()==this.valueOf();
});
Long.toHexString=Long.prototype.toHexString=function(i){
return i.toString(16);
};
Long.toOctalString=Long.prototype.toOctalString=function(i){
return i.toString(8);
};
Long.toBinaryString=Long.prototype.toBinaryString=function(i){
return i.toString(2);
};

m$(Long,"decode",
function(n){
  n = Integer.decodeRaw(n);
  if (isNaN(n))
    throw Clazz.new(NumberFormatException.c$$S, ["Invalid Long"]);
  return Clazz.new(Long.c$, [n]);
}, 1);

Clazz._setDeclared("java.lang.Short", java.lang.Short = Short = function(){
if (typeof arguments[0] != "object")this.c$(arguments[0]);
});
decorateAsNumber(Short, "Short", "short", "H");

m$(Short, "c$",
function (v) {
 v == null && (v = 0);
 if (typeof v != "number")
  v = Integer.parseIntRadix(v, 10);
 v = v.shortValue();
 this.valueOf = function () {return v;};
}, 1);
Short.prototype.c$ = Short.c$;



Short.toString = Short.prototype.toString = function () {
  if (arguments.length != 0) {
    return "" + arguments[0];
  } else if (this === Short) {
    return "class java.lang.Short"; // Short.class.toString
  }
  return "" + this.valueOf ();
};

Short.MIN_VALUE = Short.prototype.MIN_VALUE = -32768;
Short.MAX_VALUE = Short.prototype.MAX_VALUE = 32767;
//Short.TYPE = Short.prototype.TYPE = Short;

m$(Short, "parseShortRadix",
function (s, radix) {
return Integer.parseIntRadix(s, radix).shortValue();
});
Short.parseShortRadix = Short.prototype.parseShortRadix;

m$(Short, "parseShort",
function (s) {
return Short.parseShortRadix (s, 10);
});

Short.parseShort = Short.prototype.parseShort;

m$(Short, "$valueOf",
function (s) {
  return Clazz.new(Short.c$, [s]);
});

Short.$valueOf = Short.prototype.$valueOf;
m$(Short, "equals",
function (s) {
if(s == null || !Clazz.instanceOf(s, Short) ){
  return false;
}
return s.valueOf()  == this.valueOf();
});
Short.$valueOf = Short.prototype.$valueOf;
m$(Short, "equals$O",
function (s) {
if(s == null || !Clazz.instanceOf(s, Short) ){
  return false;
}
return s.valueOf()  == this.valueOf();
});
Short.toHexString = Short.prototype.toHexString = function (i) {
  return i.toString (16);
};
Short.toOctalString = Short.prototype.toOctalString = function (i) {
  return i.toString (8);
};
Short.toBinaryString = Short.prototype.toBinaryString = function (i) {
  return i.toString (2);
};
m$(Short, "decode",
function(n){
  n = Integer.decodeRaw(n);
  if (isNaN(n) || n < -32768|| n > 32767)
    throw Clazz.new(NumberFormatException.c$$S, ["Invalid Short"]);
  return Clazz.new(Short.c$, [n]);
}, 1);

Clazz._setDeclared("java.lang.Byte", java.lang.Byte=Byte=function(){
if (typeof arguments[0] != "object")this.c$(arguments[0]);
});
decorateAsNumber(Byte,"Byte", "byte", "B");

m$(Byte, "c$", function(v){
 if (typeof v != "number")
   v = Integer.parseIntRadix(v, 10);
 v = v.byteValue();
this.valueOf=function(){return v;};
this.byteValue = function(){return v};
}, 1);

Byte.toString=Byte.prototype.toString=function(){
if(arguments.length!=0){
return""+arguments[0];
}else if(this===Byte){
return"class java.lang.Byte";
}
return""+this.valueOf();
};

Byte.serialVersionUID=Byte.prototype.serialVersionUID=-7183698231559129828;
Byte.MIN_VALUE=Byte.prototype.MIN_VALUE=-128;
Byte.MAX_VALUE=Byte.prototype.MAX_VALUE=127;
Byte.SIZE=Byte.prototype.SIZE=8;
//Byte.TYPE=Byte.prototype.TYPE=Byte;

m$(Byte,"parseByteRadix",
function(s,radix){
 return Integer.parseIntRadix(s, radix).byteValue();
});
Byte.parseByteRadix=Byte.prototype.parseByteRadix;

m$(Byte,"parseByte",
function(s){
return Byte.parseByte(s,10);
});

Byte.parseByte=Byte.prototype.parseByte;

m$(Byte, "$valueOf",
function (s) {
  return Clazz.new(Byte.c$, [s]);
});

Byte.$valueOf=Byte.prototype.$valueOf;
m$(Byte,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Byte)){
return false;
}
return s.valueOf()==this.valueOf();
});
Byte.$valueOf=Byte.prototype.$valueOf;
m$(Byte,"equals$O",
function(s){
if(s==null||!Clazz.instanceOf(s,Byte)){
return false;
}
return s.valueOf()==this.valueOf();
});
Byte.toHexString=Byte.prototype.toHexString=function(i){
return i.toString(16);
};
Byte.toOctalString=Byte.prototype.toOctalString=function(i){
return i.toString(8);
};
Byte.toBinaryString=Byte.prototype.toBinaryString=function(i){
return i.toString(2);
};
m$(Byte,"decode",
function(n){
  n = Integer.decodeRaw(n);
  if (isNaN(n) || n < -128|| n > 127)
    throw Clazz.new(NumberFormatException.c$$S, ["Invalid Byte"]);
  return Clazz.new(Byte.c$, [n]);
}, 1);

Clazz._floatToString = function(f) {
 var s = ""+f
 if (s.indexOf(".") < 0 && s.indexOf("e") < 0 && s.indexOf("Inf") < 0)
    s += ".0";
 return s;
}

Clazz._setDeclared("java.lang.Float", java.lang.Float=Float=function(){
if (typeof arguments[0] != "object")this.c$(arguments[0]);
});
decorateAsNumber(Float,"Float", "float", "F");

m$(Float, "c$", function(v){
 v == null && (v = 0);
 if (typeof v != "number") 
  v = Number(v);
 this.valueOf=function(){return v;}
}, 1);

Float.toString=Float.prototype.toString=function(){
if(arguments.length!=0){
return Clazz._floatToString(arguments[0]);
}else if(this===Float){
return"class java.lang.Float";
}
return Clazz._floatToString(this.valueOf());
};

Clazz._a32 = null;

Float.floatToIntBits = function(f) {
var a = Clazz._a32 || (Clazz._a32 = new Float32Array(1));
a[0] = f;
return new Int32Array(a.buffer)[0]; 
}

Float.serialVersionUID=Float.prototype.serialVersionUID=-2671257302660747028;
Float.MIN_VALUE=Float.prototype.MIN_VALUE=3.4028235e+38;
Float.MAX_VALUE=Float.prototype.MAX_VALUE=1.4e-45;
Float.NEGATIVE_INFINITY=Number.NEGATIVE_INFINITY;
Float.POSITIVE_INFINITY=Number.POSITIVE_INFINITY;
Float.NaN=Number.NaN;
//Float.TYPE=Float.prototype.TYPE=Float;

m$(Float,"parseFloat",
function(s){
if(s==null){
throw Clazz.new(NumberFormatException.c$$S, ["null"]);
}
if (typeof s == "number")return s;  // important -- typeof NaN is "number" and is OK here
var floatVal=Number(s);
if(isNaN(floatVal)){
throw Clazz.new(NumberFormatException.c$$S, ["Not a Number : "+s]);
}
return floatVal;
});
Float.parseFloat=Float.prototype.parseFloat;

m$(Float,"$valueOf",
function(s){
return Clazz.new(Float.c$, [s]);
});

Float.$valueOf=Float.prototype.$valueOf;

m$(Float,"isNaN",
function(num){
return isNaN(arguments.length == 1 ? num : this.valueOf());
});
Float.isNaN=Float.prototype.isNaN;
m$(Float,"isInfinite",
function(num){
return !Number.isFinite(arguments.length == 1 ? num : this.valueOf());
});
Float.isInfinite=Float.prototype.isInfinite;

m$(Float,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Float)){
return false;
}
return s.valueOf()==this.valueOf();
});
m$(Float,"equals$O",
function(s){
if(s==null||!Clazz.instanceOf(s,Float)){
return false;
}
return s.valueOf()==this.valueOf();
});

Clazz._setDeclared("java.lang.Double", java.lang.Double=Double=function(){
if (typeof arguments[0] != "object")this.c$(arguments[0]);
});
decorateAsNumber(Double,"Double", "double", "D");
Double.toString=Double.prototype.toString=function(){
if(arguments.length!=0){
return Clazz._floatToString(arguments[0]);
}else if(this===Double){
return"class java.lang.Double";
}
return Clazz._floatToString(this.valueOf());
};

m$(Double, "c$", function(v){
 v == null && (v = 0);
 if (typeof v != "number") 
  v = Double.parseDouble(v);
 this.valueOf=function(){return v;};
}, 1);

Double.serialVersionUID=Double.prototype.serialVersionUID=-9172774392245257468;
Double.MIN_VALUE=Double.prototype.MIN_VALUE=4.9e-324;
Double.MAX_VALUE=Double.prototype.MAX_VALUE=1.7976931348623157e+308;
Double.NEGATIVE_INFINITY=Number.NEGATIVE_INFINITY;
Double.POSITIVE_INFINITY=Number.POSITIVE_INFINITY;
Double.NaN=Number.NaN;
//Double.TYPE=Double.prototype.TYPE=Double;

m$(Double,"isNaN",
function(num){
return isNaN(arguments.length == 1 ? num : this.valueOf());
});
Double.isNaN=Double.prototype.isNaN;
m$(Double,"isInfinite",
function(num){
return!Number.isFinite(arguments.length == 1 ? num : this.valueOf());
});
Double.isInfinite=Double.prototype.isInfinite;

m$(Double,"parseDouble",
function(s){
if(s==null){
  throw Clazz.new(NumberFormatException.c$$S, ["null"]);
}
if (typeof s == "number")return s;  // important -- typeof NaN is "number" and is OK here
var doubleVal=Number(s);
if(isNaN(doubleVal)){
throw Clazz.new(NumberFormatException.c$$S, ["Not a Number : "+s]);
}
return doubleVal;
});
Double.parseDouble=Double.prototype.parseDouble;

m$(Double,"$valueOf",
function(v){
return Clazz.new(Double.c$, [v]);
});

Double.$valueOf=Double.prototype.$valueOf;

m$(Double,"equals",
function(s){
if(s==null||!Clazz.instanceOf(s,Double)){
return false;
}
return s.valueOf()==this.valueOf();
});
m$(Double,"equals$O",
function(s){
if(s==null||!Clazz.instanceOf(s,Double)){
return false;
}
return s.valueOf()==this.valueOf();
});

Clazz._setDeclared("java.lang.Boolean", 
Boolean = java.lang.Boolean = Boolean || function(){
if (typeof arguments[0] != "object")this.c$(arguments[0]);
});

if (supportsNativeObject) {
  extendObject(Boolean);
}
Boolean.__CLASS_NAME__="Boolean";
implementOf(Boolean,[java.io.Serializable,java.lang.Comparable]);
setJ2STypeclass(Boolean, "boolean", "Z");
Boolean.equals=Clazz._inF.equals;
Boolean.getName=Clazz._inF.getName;
Boolean.serialVersionUID=Boolean.prototype.serialVersionUID=-3665804199014368530;

m$(Boolean, "c$",
function(s){
  var b = ((typeof s == "string" ? Boolean.toBoolean(s) : s) ? true : false);
  this.valueOf=function(){return b;};
}, 1);

m$(Boolean,"parseBoolean",
function(s){
return Boolean.toBoolean(s);
}, 1);
m$(Boolean,"booleanValue",
function(){
return this.valueOf();
});
m$(Boolean,"$valueOf",
function(b){
return((typeof b == "string"? "true".equalsIgnoreCase$S(b) : b)?Boolean.TRUE:Boolean.FALSE);
}, 1);

m$(Boolean,"toString",
function(){
return this.valueOf()?"true":"false";
});
m$(Boolean,"hashCode",
function(){
return this.valueOf()?1231:1237;
});
m$(Boolean,"equals",
function(obj){
if(Clazz.instanceOf(obj,Boolean)){
return this.booleanValue()==obj.booleanValue();
}return false;
});
m$(Boolean,"equals$O",
function(obj){
if(Clazz.instanceOf(obj,Boolean)){
return this.booleanValue()==obj.booleanValue();
}return false;
});
m$(Boolean,"getBoolean",
function(name){
var result=false;
try{
result=Boolean.toBoolean(System.getProperty(name));
}catch(e){
if(Clazz.instanceOf(e,IllegalArgumentException)){
}else if(Clazz.instanceOf(e,NullPointerException)){
}else{
throw e;
}
}
return result;
}, 1);
m$(Boolean,"compareTo",
function(b){
return(b.value==this.value?0:(this.value?1:-1));
});
m$(Boolean,"toBoolean",
function(name){
return(typeof name == "string" ? name.equalsIgnoreCase$S("true") : !!name);
}, 1);

// the need is to have new Boolean(string), but that won't work with native Boolean
// so instead we have to do a lexical switch from "new Boolean" to "Boolean.from"
m$(Boolean,"from",
function(name){
return Clazz.new(Boolean.c$, [typeof name == "string" ? name.equalsIgnoreCase$S("true") : !!name]);
}, 1);

Boolean.TRUE=Boolean.prototype.TRUE=Clazz.new(Boolean.c$, [true]);
Boolean.FALSE=Boolean.prototype.FALSE=Clazz.new(Boolean.c$, [false]);
//Boolean.TYPE=Boolean.prototype.TYPE=Boolean;


Clazz._Encoding={
  UTF8:"utf-8",
  UTF16:"utf-16",
  ASCII:"ascii"
};

(function(Encoding) {

Encoding.guessEncoding=function(str){
return (str.charCodeAt(0)==0xEF&&str.charCodeAt(1)==0xBB&&str.charCodeAt(2)==0xBF ? Encoding.UTF8
  : str.charCodeAt(0)==0xFF&&str.charCodeAt(1)==0xFE ? Encoding.UTF16 
  : Encoding.ASCII);
};

Encoding.guessEncodingArray=function(a, offset){
return (a[offset]==0xEF&&a[offset + 1]==0xBB&&a[offset + 2]==0xBF ? Encoding.UTF8 
  : a[offset + 0]==0xFF&&a[offset + 1]==0xFE ? Encoding.UTF16 : Encoding.ASCII);
};

Encoding.readUTF8Array=function(a, offset, length){
if (arguments.length == 1) {
  offset = 0;
  length = a.length;
}
var encoding=Encoding.guessEncodingArray(a);
var startIdx=0;
if(encoding==Encoding.UTF8){
startIdx=3;
}else if(encoding==Encoding.UTF16){
startIdx=2;
}
var arrs=new Array();
for(var i=offset + startIdx, endIdx = offset + length; i < endIdx; i++){
var charCode=a[i];
if(charCode<0x80){
arrs[arrs.length]=String.fromCharCode(charCode);
}else if(charCode>0xc0&&charCode<0xe0){
var c1=charCode&0x1f;
var c2=a[++i]&0x3f;
var c=(c1<<6)+c2;
arrs[arrs.length]=String.fromCharCode(c);
}else if(charCode>=0xe0){
var c1=charCode&0x0f;
var c2=a[++i]&0x3f;
var c3=a[++i]&0x3f;
var c=(c1<<12)+(c2<<6)+c3;
arrs[arrs.length]=String.fromCharCode(c);
}
}
return arrs.join('');
};


Encoding.convert2UTF8=function(str){
var encoding=this.guessEncoding(str);
var startIdx=0;
if(encoding==Encoding.UTF8){
return str;
}else if(encoding==Encoding.UTF16){
startIdx=2;
}

var offset=0;
var arrs=new Array(offset+str.length-startIdx);

for(var i=startIdx;i<str.length;i++){
var charCode=str.charCodeAt(i);
if(charCode<0x80){
arrs[offset+i-startIdx]=str.charAt(i);
}else if(charCode<=0x07ff){
var c1=0xc0+((charCode&0x07c0)>>6);
var c2=0x80+(charCode&0x003f);
arrs[offset+i-startIdx]=String.fromCharCode(c1)+String.fromCharCode(c2);
}else{
var c1=0xe0+((charCode&0xf000)>>12);
var c2=0x80+((charCode&0x0fc0)>>6);
var c3=0x80+(charCode&0x003f);
arrs[offset+i-startIdx]=String.fromCharCode(c1)+String.fromCharCode(c2)+String.fromCharCode(c3);
}
}
return arrs.join('');
};

if(String.prototype.$replace==null){

Clazz._setDeclared("java.lang.String", java.lang.String=String);

if(supportsNativeObject){
  extendObject(String);
}

// Actually, String does not implement CharSequence because it does not
// implement getSubsequence() or length(). Any use of CharSequence that
// utilizes either of these methods must explicitly check for typeof x.length
// or existance of x.subSequence.  
// classes affected include:
//   java.io.CharArrayWriter,StringWriter,Writer
//   java.lang.AbstractStringBuilder
//   java.util.regex.Matcher,Pattern
 
implementOf(String,[java.io.Serializable,CharSequence,Comparable]);

String.__PARAMCODE = "S";
String.getName=Clazz._inF.getName;

String.serialVersionUID=String.prototype.serialVersionUID=-6849794470754667710;

// TODO: missing some methods here
var formatterClass;

if (!String.format)
 String.format = function() {
  if (!formatterClass)
    formatterClass = Clazz._4Name("java.util.Formatter", null, null, true);
  var f = new formatterClass();
  return f.format$S$OA.apply(f,arguments).toString();
 };

;(function(sp) {

sp.$replace=function(c1,c2){
  if (c1 == c2 || this.indexOf (c1) < 0) return "" + this;
  if (c1.length == 1) {
    if ("\\$.*+|?^{}()[]".indexOf(c1) >= 0)   
      c1 = "\\" + c1;
  } else {    
    c1=c1.replace(/([\\\$\.\*\+\|\?\^\{\}\(\)\[\]])/g,function($0,$1){
      return "\\"+$1;
    });
  }
  return this.replace(new RegExp(c1,"gm"),c2);
};
sp.$generateExpFunction$S=function(str){
var arr=[];
var orders=[];
var idx=0;
arr[0]="";
var i=0;
for(;i<str.length;i++){
var ch=str.charAt(i);
if(i!=str.length-1&&ch=='\\'){ // ' ) {
i++;
var c=str.charAt(i);
if(c=='\\'){ // ' ){
arr[idx]+='\\';
}
arr[idx]+=c;
}else if(i!=str.length-1&&ch=='$'){
i++;
orders[idx]=parseInt(str.charAt(i));
idx++;
arr[idx]="";
}else if(ch=='\r'){
arr[idx]+="\\r";
}else if(ch=='\n'){
arr[idx]+="\\n";
}else if(ch=='\t'){
arr[idx]+="\\t";
}else if(ch=='\"'){
arr[idx]+="\\\"";
}else{
arr[idx]+=ch;
}
}
var funStr="f = function (";
var max=Math.max.apply({},orders);
for(i=0;i<=max;i++){
funStr+="$"+i;
if(i!=max){
funStr+=", ";
}
}
funStr+=") { return ";
for(i=0;i<arr.length-1;i++){
funStr+="\""+arr[i]+"\" + $"+orders[i]+" + ";
}
funStr+="\""+arr[i]+"\"; }";
var f=null;
eval(funStr)
return f;
};

sp.replaceAll$S$S=function(exp,str){
var regExp=new RegExp(exp,"gm");
return this.replace(regExp,this.$generateExpFunction(str));
};
sp.replaceFirst$S$S=function(exp,str){
var regExp=new RegExp(exp,"m");
return this.replace(regExp,this.$generateExpFunction(str));
};
sp.matches$S=function(exp){
if(exp!=null){
exp="^("+exp+")$";
}
var regExp=new RegExp(exp,"gm");
var m=this.match(regExp);
return m!=null&&m.length!=0;
};

sp.regionMatches$I$S$I$I=function(toffset,other,ooffset,len){
  return this.regionMatches$Z$I$S$I$I(false,toffset,other,ooffset,len);
}

sp.regionMatches$Z$I$S$I$I=function(ignoreCase,toffset,other,ooffset,len){
var to=toffset;
var po=ooffset;

if((ooffset<0)||(toffset<0)||(toffset>this.length-len)||
(ooffset>other.length-len)){
return false;
}
var s1=this.substring(toffset,toffset+len);
var s2=other.substring(ooffset,ooffset+len);
if(ignoreCase){
s1=s1.toLowerCase();
s2=s2.toLowerCase();
}
return s1==s2;
};



sp.$plit=function(regex,limit){
if (!limit && regex == " ")
  return this.split(regex);

if(limit!=null&&limit>0){
if(limit==1){
return this;
}
var regExp=new RegExp("("+regex+")","gm");
var count=1;
var s=this.replace(regExp,function($0,$1){
count++;
if(count==limit){
return"@@_@@";
}else if(count>limit){
return $0;
}else{
return $0;
}
});
regExp=new RegExp(regex,"gm");
var arr=this.split(regExp);
if(arr.length>limit){
arr[limit-1]=s.substring(s.indexOf("@@_@@")+5);
arr.length=limit;
}
return arr;
}else{
var regExp=new RegExp(regex,"gm");
return this.split(regExp);
}
};

if (!sp.trim)
sp.trim=function(){
return this.replace(/^\s+/g,'').replace(/\s+$/g,'');
};

var sn=function(s, prefix,toffset){
  var to=toffset;
  var po=0;
  var pc=prefix.length;
  
  if((toffset<0)||(toffset>s.length-pc)){
  return false;
  }
  while(--pc>=0){
  if(s.charAt(to++)!=prefix.charAt(po++)){
  return false;
  }
  }
  return true;
};

sp.startsWith$S=function(prefix){
if(arguments.length==1){
return sn(this,arguments[0],0);
}else if(arguments.length==2){
return sn(this,arguments[0],arguments[1]);
}else{
return false;
}
};

sp.endsWith$S=function(suffix){
return sn(this, suffix,this.length-suffix.length);
};

sp.equals=sp.equals$O = function(anObject){
return this.valueOf()==anObject;
};

sp.equalsIgnoreCase$S=function(anotherString){
return(anotherString==null)?false:(this==anotherString
||this.toLowerCase()==anotherString.toLowerCase());
};


sp.hash=0;

sp.hashCode=function(){
var h=this.hash;
if(h==0){
var off=0;
var len=this.length;
for(var i=0;i<len;i++){
h=31*h+this.charCodeAt(off++);
h&=0xffffffff;
}
this.hash=h;
}
return h;
};

sp.getBytes=function(){
if(arguments.length==4){
return this.getChars(arguments[0],arguments[1],arguments[2],arguments[3]);
}
var s=this;
if(arguments.length==1){
var cs=arguments[0].toString().toLowerCase();
var charset=[
"utf-8","UTF8","us-ascii","iso-8859-1","8859_1","gb2312","gb18030","gbk"
];
var existed=false;
for(var i=0;i<charset.length;i++){
if(charset[i]==cs){
existed=true;
break;
}
}
if(!existed){
throw new java.io.UnsupportedEncodingException();
}
if(cs=="utf-8"||cs=="utf8"){
s=Encoding.convert2UTF8(this);
}
}
var arrs=Clazz.newArray$(Byte.TYPE, [s.length]);
for(var i=0, ii=0;i<s.length;i++){
var c=s.charCodeAt(i);
if(c>255){
arrs[ii]=0x1a;
arrs[ii+1]=c&0xff;
arrs[ii+2]=(c&0xff00)>>8;
ii+=2;
}else{
arrs[ii]=c;
}
ii++;
}
return arrs;
};

sp.contains$S = function(a) {return this.indexOf(a) >= 0}  // bh added
sp.compareTo$S = function(a){return this > a ? 1 : this < a ? -1 : 0} // bh added



sp.toCharArray=function(){
var result=new Array(this.length);
for(var i=0;i<this.length;i++){
result[i]=this.charAt(i);
}
return result;
};
String.value0f=String.valueOf;
// TODO: many of these
String.valueOf=function(o){
if(o=="undefined"){
return String.value0f();
}
if(o instanceof Array){
if(arguments.length==1){
return o.join('');
}else{
var off=arguments[1];
var len=arguments[2];
var oo=new Array(len);
for(var i=0;i<len;i++){
oo[i]=o[off+i];
}
return oo.join('');
}
}
return""+o;
};

sp.subSequence$I$I=function(beginIndex,endIndex){
return this.substring(beginIndex,endIndex);
};

sp.compareToIgnoreCase$S=function(str){
if(str==null){
throw new NullPointerException();
}
var s1=this.toUpperCase();
var s2=str.toUpperCase();
if(s1==s2){
return 0;
}else{
var s1=this.toLowerCase();
var s2=str.toLowerCase();
if(s1==s2){
return 0;
}else if(s1>s2){
return 1;
}else{
return-1;
}
}
};


sp.contentEquals$StringBuffer=function(sb){
return (this == sb.s);
};

sp.contains$CharSequence=function(cs){
if(cs==null)
  throw new NullPointerException();
return (this == cs || this.length > cs.length$() && this.indexOf(cs.toString()) > -1);
};

sp.contentEquals$CharSequence=function(cs){
if(cs==null)
  throw new NullPointerException();
if(this == cs)
 return true;
if(this.length!=cs.length$())
 return false;
var v=cs.getValue();
var n=this.length;
while(n-- >= 0){
  if(this.charCodeAt(n)!=v[n]){
    return false;
  }
}
return true;
};

sp.getChars$I$I$CA$I = sp.getChars=function(srcBegin,srcEnd,dst,dstBegin){
if(srcBegin<0){
throw new StringIndexOutOfBoundsException(srcBegin);
}
if(srcEnd>this.length){
throw new StringIndexOutOfBoundsException(srcEnd);
}
if(srcBegin>srcEnd){
throw new StringIndexOutOfBoundsException(srcEnd-srcBegin);
}
if(dst==null){
throw new NullPointerException();
}
for(var i=0;i<srcEnd-srcBegin;i++){
dst[dstBegin+i]=this.charAt(srcBegin+i);
}
};

sp.$concat=sp.concat;
sp.concat=function(s){
if(s==null){
throw new NullPointerException();
}
return this.$concat(s);
};

sp.$lastIndexOf=sp.lastIndexOf;
sp.lastIndexOf=function(s,last){
if(last!=null&&last+this.length<=0){
return-1;
}
if(last!=null){
return this.$lastIndexOf(s,last);
}else{
return this.$lastIndexOf(s);
}
};

sp.intern=function(){
return this.valueOf();
};

String.copyValueOf=sp.copyValueOf=function(){
  if(arguments.length==1){
  return String.instantialize(arguments[0]);
  }else{
  return String.instantialize(arguments[0],arguments[1],arguments[2]);
  }
};

sp.codePointAt || (sp.codePointAt = sp.charCodeAt); // Firefox only
sp.$c = function(){return this.charCodeAt(0)};
sp.codePointAt$I = sp.codePointAt;
// in order to implement CharSequence, we need .length(), but String only has .length
// so in ALL classes the transpiler changes x.length() to x.length$()
sp.length$ = function() {return this.length}; // to implement CharSequence

sp.charAt$I = sp.charAt;
sp.subSequence$I$I = sp.substring;

sp.toString || (sp.toString=function(){return this.valueOf();});
})(String.prototype);

/*
String(byte[] bytes)
String(char[] value)
String(StringBuffer buffer)
String(StringBuilder builder)
String(String original)

String(byte[] ascii, int hibyte)
String(byte[] bytes, Charset charset)
String(byte[] bytes, String charsetName)

String(byte[] bytes, int offset, int length)
String(char[] value, int offset, int count)
String(int[] codePoints, int offset, int count)

String(byte[] bytes, int offset, int length, Charset charset)
String(byte[] bytes, int offset, int length, String charsetName)
String(byte[] ascii, int hibyte, int offset, int count)
*/

String.instantialize=function(){
switch (arguments.length) {
case 0:
  return new String();
case 1:
  // String(byte[] bytes)
  // String(char[] value)
  // String(StringBuffer buffer)
  // String(StringBuilder builder)
  // String(String original)
  var x=arguments[0];
  if (x.__BYTESIZE || x instanceof Array){
    return (x.length == 0 ? "" : typeof x[0]=="number" ? Encoding.readUTF8Array(x) : x.join(''));
  }
  return x.toString();
case 2:  
  // String(byte[] ascii, int hibyte)
  // String(byte[] bytes, Charset charset)
  // String(byte[] bytes, String charsetName)

  var x=arguments[0];
  var hibyte=arguments[1];
  return (typeof hibyte=="number" ? String.instantialize(x,hibyte,0,x.length) 
    : String.instantialize(x,0,x.length,hibyte));
case 3:
  // String(byte[] bytes, int offset, int length)
  // String(char[] value, int offset, int count)
  // String(int[] codePoints, int offset, int count)

  var bytes=arguments[0];
  var offset=arguments[1];
  var length=arguments[2];
  if(arguments[2]instanceof Array){
    // ???
    bytes=arguments[2];
    offset=arguments[0];
    length=arguments[1];
  }
  var arr=new Array(length);
  if(offset<0||length+offset>bytes.length){
    throw new IndexOutOfBoundsException();
  }
  if(length>0){
    var isChar=(bytes[offset].length!=null);
    if(isChar){
      for(var i=0;i<length;i++){
        arr[i]=bytes[offset+i];
      }
    }else{
      for(var i=0;i<length;i++){
        arr[i]=String.fromCharCode(bytes[offset+i]);
      }
    }
  }
  return arr.join('');
case 4:
  // String(byte[] bytes, int offset, int length, Charset charset)
  // String(byte[] bytes, int offset, int length, String charsetName)
  // String(byte[] ascii, int hibyte, int offset, int count)

  var bytes=arguments[0];
  var encoding=arguments[3];
  if(typeof encoding != "number"){
    // assumes UTF-8
    var offset=arguments[1];
    var length=arguments[2];
    return Encoding.readUTF8Array(bytes, offset, length);
  }
  var count=arguments[3];
  var offset=arguments[2];
  var hibyte=arguments[1];
  var value=new Array(count);
  if(hibyte==0){
    for(var i=count;i-->0;){
      value[i]=String.fromCharCode(bytes[i+offset]&0xff);
    }
  }else{
    hibyte<<=8;
    for(var i=count;i-->0;){
      value[i]=String.fromCharCode(hibyte|(bytes[i+offset]&0xff));
    }
  }
  return value.join('');
default:
  // ????
  var s="";
  for(var i=0;i<arguments.length;i++){
    s+=arguments[i];
  }
  return s;
}
};

}

})(Clazz._Encoding);

C$=Clazz.newClass$(java.lang,"Character",function(){
if (typeof arguments[0] != "object")this.c$(arguments[0]);
},null,[java.io.Serializable,Comparable]);
Clazz._setDeclared("java.lang.Character", java.lang.Character); 
setJ2STypeclass(Character, "char", "C");

m$(C$,"getName",
function(){
return "?";
}, 1);

m$(C$,"c$",
function(value){
this.value=value;
}, 1);

m$(C$,"charValue",
function(){
return this.value;
});

m$(C$,"hashCode",
function(){
return(this.value).charCodeAt(0);
});
m$(C$,"equals",
function(obj){
if(Clazz.instanceOf(obj,Character)){
return(this.value).charCodeAt(0)==((obj).charValue()).charCodeAt(0);
}return false;
});
m$(C$,"equals$O",
function(obj){
if(Clazz.instanceOf(obj,Character)){
return(this.value).charCodeAt(0)==((obj).charValue()).charCodeAt(0);
}return false;
});
m$(C$,"charCodeAt",
function(i){
return(this.value).charCodeAt(i);
});

C$.prototype.$c = function(){return this.value.charCodeAt(0)};

m$(C$,"compareTo",
function(c){
return(this.value).charCodeAt(0)-(c.value).charCodeAt(0);
});
m$(C$,"toLowerCase",
function(c){
return(""+c).toLowerCase().charAt(0);
}, 1);
m$(C$,"toUpperCase",
function(c){
return(""+c).toUpperCase().charAt(0);
}, 1);
m$(C$,"isDigit",
function(c){
c = c.charCodeAt(0);
return (48 <= c && c <= 57);
}, 1);
m$(C$,"isUpperCase",
function(c){
c = c.charCodeAt(0);
return (65 <= c && c <= 90);
}, 1);
m$(C$,"isLowerCase",
function(c){
c = c.charCodeAt(0);
return (97 <= c && c <= 122);
}, 1);
m$(C$,"isWhitespace",
function(c){
c = (c).charCodeAt(0);
return (c >= 0x1c && c <= 0x20 || c >= 0x9 && c <= 0xd || c == 0x1680
  || c >= 0x2000 && c != 0x2007 && (c <= 0x200b || c == 0x2028 || c == 0x2029 || c == 0x3000));
}, 1);
m$(C$,"isLetter",
function(c){
c = c.charCodeAt(0);
return (65 <= c && c <= 90 || 97 <= c && c <= 122);
}, 1);
m$(C$,"isLetterOrDigit",
function(c){
c = c.charCodeAt(0);
return (65 <= c && c <= 90 || 97 <= c && c <= 122 || 48 <= c && c <= 57);
}, 1);
m$(C$,"isSpaceChar",
function(c){
 var i = c.charCodeAt(0);
if(i==0x20||i==0xa0||i==0x1680)return true;
if(i<0x2000)return false;
return i<=0x200b||i==0x2028||i==0x2029||i==0x202f||i==0x3000;
}, 1);
m$(C$,"digit",
function(c,radix){
var i = c.charCodeAt(0);
if(radix >= 2 && radix <= 36){
  if(i < 128){
    var result = -1;
    if(48 <= i && i <= 57){
    result = i - 48;
    }else if(97 <= i && i <= 122){
    result = i - 87;
    }else if(65 <= i && i <= 90){
    result=i-(55);
    }
    return (result < radix ? result : -1);
  }
}
return -1;
}, 1);
m$(C$,"toString",
function(c){
if (arguments.length == 0) {
  if(this===Character){
    return"class java.lang.Character";
  }
  var buf=[this.value];
  return String.valueOf(buf);
}
return String.valueOf(c);
}, 1);
m$(C$,"charCount", function(codePoint){
  return codePoint >= 0x010000 ? 2 : 1;
}, 1);

// TODO: Only asking for problems declaring Date. This is not necessary

Clazz._setDeclared("java.util.Date", java.util.Date=Date);
//Date.TYPE="java.util.Date";
Date.__CLASS_NAME__="Date";
implementOf(Date,[java.io.Serializable,java.lang.Comparable]);

m$(java.util.Date, "c$", function(t) {
  this.setTime(t || System.currentTimeMillis())
}, 1);

m$(java.util.Date,"clone",
function(){
return new Date(this.getTime());
});

m$(java.util.Date,"before",
function(when){
return this.getTime()<when.getTime();
});
m$(java.util.Date,"after",
function(when){
return this.getTime()>when.getTime();
});
m$(java.util.Date,"equals$O",
function(obj){
return Clazz.instanceOf(obj,java.util.Date)&&this.getTime()==(obj).getTime();
});
m$(java.util.Date,"compareTo",
function(anotherDate){
var thisTime=this.getTime();
var anotherTime=anotherDate.getTime();
return(thisTime<anotherTime?-1:(thisTime==anotherTime?0:1));
});
m$(java.util.Date,"compareTo",
function(o){
return this.compareTo(o);
});
m$(java.util.Date,"hashCode",
function(){
var ht=this.getTime();
return parseInt(ht)^parseInt((ht>>32));
});

// TODO: This is not right. Why here????

/*
C$=declareType(java.util,"EventObject",null,java.io.Serializable);
Clazz._setDeclared("java.util.EventObject", java.util.EventObject); 

m$(C$, "c$", function(source){
this.source=null;
if(arguments.length > 0  && source!=null)this.source=source;
else throw new IllegalArgumentException();
}, 1);

m$(C$,"getSource",
function(){
return this.source;
});
m$(C$,"toString",
function(){
return this.getClass().getName()+"[source="+String.valueOf(this.source)+']';
});
Clazz.newInterface$(java.util,"EventListener");

C$=Clazz.newClass$(function(){
this.listener=null;
},java.util,"EventListenerProxy",null,java.util.EventListener);
m$(C$, "c$", function(listener){
this.listener=listener;
},1);

m$(C$,"getListener",
function(){
return this.listener;
});
*/

Clazz.newInterface$(java.util,"Iterator");

Clazz.newInterface$(java.util,"ListIterator",java.util.Iterator);
Clazz.newInterface$(java.util,"Enumeration");
Clazz.newInterface$(java.util,"Collection",Iterable);

Clazz.newInterface$(java.util,"Set",java.util.Collection);
Clazz.newInterface$(java.util,"Map");
Clazz.newInterface$(java.util.Map,"Entry");

Clazz.newInterface$(java.util,"List",java.util.Collection);

Clazz.newInterface$(java.util,"Queue",java.util.Collection);
Clazz.newInterface$(java.util,"RandomAccess");

var C$ = Clazz.newClass$ (java.lang, "Throwable", function () {
Clazz.newInstance$ (this, arguments);
}, null, java.io.Serializable);

m$(C$, 'c$', function () {
this.fillInStackTrace ();
this.detailMessage = this.stack;
this.cause = this;
}, 1);

m$(C$, 'c$$S', function (message) {
this.fillInStackTrace ();
this.cause = this;
this.detailMessage = message;
}, 1);

m$(C$, 'c$$S$Throwable', function (message, cause) {
this.fillInStackTrace ();
this.detailMessage = message;
this.cause = cause;
}, 1);

m$(C$, 'c$$Throwable', function (cause) {
this.fillInStackTrace ();
this.detailMessage = (cause == null ? this.stack : cause.toString ());
this.cause = cause;
}, 1);

m$(C$, 'getMessage', function () {return this.message || this.detailMessage});

m$(C$, 'getLocalizedMessage', function () {
return this.getMessage ();
});

m$(C$, 'getCause', function () {
return (this.cause === this ? null : this.cause);
});

m$(C$, 'initCause$Throwable', function (cause) {
if (this.cause !== this) throw Clazz.new(IllegalStateException.c$$S,["Can't overwrite cause"]);
if (cause === this) throw Clazz.new(IllegalArgumentException.c$$S,["Self-causation not permitted"]);
this.cause = cause;
return this;
});

m$(C$, 'toString', function () {
var s = this.getClass ().getName ();
var message = this.getLocalizedMessage ();
return (message != null) ? (s + ": " + message) : s;
});

m$(C$, 'getStackTrace', function () {
return this.stackTrace;
});

m$(C$, 'printStackTrace', function () {
System.err.println$O (this);
for (var i = 0; i < this.stackTrace.length; i++) {
var t = this.stackTrace[i];
var x = t.methodName.indexOf ("(");
//var n = (x < 0 ? t.methodName : t.methodName.substring (0, x)).replace (/\s+/g, "");
if (t.nativeClazz == null || Clazz.getInheritedLevel (t.nativeClazz, Throwable) < 0) {
System.err.println (t);
}
}
// from a JavaScript error 
this.stack && System.err.println(this.stack);
});

Clazz.newMethod$(C$, 'printStackTrace$java_io_PrintStream', function (s) {
this.printStackTrace ();
});

Clazz.newMethod$(C$, 'printStackTrace$java_io_PrintWriter', function (s) {
this.printStackTrace ();
});

Clazz.newMethod$(C$, 'fillInStackTrace', function () {
this.stackTrace = Clazz.newArray$(StackTraceElement);
var caller = arguments.callee.caller;
var superCaller = null;
var callerList = [];
var index = 0;
while (index < 20 && caller != null) {
  index++;
  var clazzName = null;
  var nativeClazz = null;
  superCaller = caller;
  if (superCaller.exClazz != null) {
    nativeClazz = superCaller.exClazz;
  }
  var st =Clazz.new(StackTraceElement.c$, [
    ((nativeClazz != null && nativeClazz.__CLASS_NAME__.length != 0) ?
    nativeClazz.__CLASS_NAME__ : "anonymous"),
    ((superCaller.exName == null) ? "anonymous" : superCaller.exName),
    null, -1]);    
  st.nativeClazz = nativeClazz;
  this.stackTrace.push(st);
  for (var i = 0; i < callerList.length; i++) {
    if (callerList[i] == superCaller) {
      // ... stack information lost as recursive invocation existed ...
      var st =Clazz.new(StackTraceElement.c$, ["lost", "missing", null, -3]);
      st.nativeClazz = null;
      this.stackTrace.push(st);
      index = 100;
      break;
    }
  }
  if (superCaller != null) {
    callerList.push(superCaller);
  }
  caller = (superCaller && superCaller.arguments && superCaller.arguments.callee) ? superCaller.arguments.callee.caller : null;
}
Clazz.initializingException = false;
return this;
});

Clazz.newMethod$(C$, 'setStackTrace$StackTraceElementA', function (stackTrace) {
var defensiveCopy = stackTrace.clone ();
for (var i = 0; i < defensiveCopy.length; i++) if (defensiveCopy[i] == null) throw Clazz.new(NullPointerException.c$$S,["stackTrace[" + i + "]"]);

this.stackTrace = defensiveCopy;
});

C$=Clazz.newClass$(java.lang,"StackTraceElement",function(){
this.declaringClass=null;
this.methodName=null;
this.fileName=null;
this.lineNumber=0;
},null,java.io.Serializable);

m$(C$, "c$",function(cls,method,file,line){
if(cls==null||method==null){
throw new NullPointerException();
}this.declaringClass=cls;
this.methodName=method;
this.fileName=file;
this.lineNumber=line;
},1);

m$(C$,"equals$O",
function(obj){
if(!(Clazz.instanceOf(obj,StackTraceElement))){
return false;
}var castObj=obj;
if((this.methodName==null)||(castObj.methodName==null)){
return false;
}if(!this.getMethodName().equals(castObj.getMethodName())){
return false;
}if(!this.getClassName().equals(castObj.getClassName())){
return false;
}var localFileName=this.getFileName();
if(localFileName==null){
if(castObj.getFileName()!=null){
return false;
}}else{
if(!localFileName.equals(castObj.getFileName())){
return false;
}}if(this.getLineNumber()!=castObj.getLineNumber()){
return false;
}return true;
});
m$(C$,"getClassName",
function(){
return(this.declaringClass==null)?"<unknown class>":this.declaringClass;
});
m$(C$,"getFileName",
function(){
return this.fileName;
});
m$(C$,"getLineNumber",
function(){
return this.lineNumber;
});
m$(C$,"getMethodName",
function(){
return(this.methodName==null)?"<unknown method>":this.methodName;
});
m$(C$,"hashCode",
function(){
if(this.methodName==null){
return 0;
}return this.methodName.hashCode()^this.declaringClass.hashCode();
});
m$(C$,"isNativeMethod",
function(){
return this.lineNumber==-2;
});
m$(C$,"toString",
function(){
var buf=Clazz.new(StringBuilder.c$$I, [80]);
buf.append$S(this.getClassName());
buf.append$S('.');
buf.append$S(this.getMethodName());
if(this.isNativeMethod()){
buf.append$S("(Native Method)");
}else{
var fName=this.getFileName();
if(fName==null){
buf.append$S("(Unknown Source)");
}else{
var lineNum=this.getLineNumber();
buf.append$S('(');
buf.append$S(fName);
if(lineNum>=0){
buf.append$S(':');
buf.append$I(lineNum);
}buf.append$(')');
}}return buf.toString();
});


TypeError.prototype.getMessage || (TypeError.prototype.getMessage = function(){ return (this.message || this.toString()) + (this.getStackTrace ? this.getStackTrace() : Clazz.getStackTrace())});


Clazz.Error = Error;

var declareType = function(prefix, name, clazzSuper, interfacez) {
  var cl = Clazz.newClass$(prefix, name, null, clazzSuper, interfacez);
  if (clazzSuper)
    inheritClass(cl, clazzSuper);
  return cl;
};

// at least allow Error() by itself to work as before
Clazz._Error || (Clazz._Error = Error);
(function(){
 for (var i in Throwable.prototype)
   Clazz._Error.prototype[i] = Throwable.prototype[i];
})();

inheritClass(Clazz._Error, Throwable);
Clazz.newClass$ (java.lang, "Error", function (){return Clazz._Error();}, Throwable);

C$ = declareType(java.lang,"Exception",Throwable);
m$(C$, "c$", function(){}, 1);

declareType(java.lang,"RuntimeException",Exception);
declareType(java.lang,"IllegalArgumentException",RuntimeException);
declareType(java.lang,"LinkageError",Error);
declareType(java.lang,"VirtualMachineError",Error);
declareType(java.lang,"IncompatibleClassChangeError",LinkageError);

declareType(java.lang,"AbstractMethodError",IncompatibleClassChangeError);
declareType(java.lang,"ArithmeticException",RuntimeException);
declareType(java.lang,"ArrayStoreException",RuntimeException);
declareType(java.lang,"ClassCircularityError",LinkageError);
declareType(java.lang,"ClassFormatError",LinkageError);
declareType(java.lang,"CloneNotSupportedException",Exception);
declareType(java.lang,"IllegalAccessError",IncompatibleClassChangeError);
declareType(java.lang,"IllegalAccessException",Exception);
declareType(java.lang,"IllegalMonitorStateException",RuntimeException);
declareType(java.lang,"IllegalStateException",RuntimeException);
declareType(java.lang,"IllegalThreadStateException",IllegalArgumentException);
declareType(java.lang,"IndexOutOfBoundsException",RuntimeException);
declareType(java.lang,"InstantiationError",IncompatibleClassChangeError);
declareType(java.lang,"InstantiationException",Exception);
declareType(java.lang,"InternalError",VirtualMachineError);
declareType(java.lang,"InterruptedException",Exception);
declareType(java.lang,"NegativeArraySizeException",RuntimeException);
declareType(java.lang,"NoClassDefFoundError",LinkageError);
declareType(java.lang,"NoSuchFieldError",IncompatibleClassChangeError);
declareType(java.lang,"NoSuchFieldException",Exception);
declareType(java.lang,"NoSuchMethodException",Exception);
declareType(java.lang,"NoSuchMethodError",IncompatibleClassChangeError);
declareType(java.lang,"NullPointerException",RuntimeException);
declareType(java.lang,"NumberFormatException",IllegalArgumentException);
declareType(java.lang,"OutOfMemoryError",VirtualMachineError);
declareType(java.lang,"SecurityException",RuntimeException);
declareType(java.lang,"StackOverflowError",VirtualMachineError);
declareType(java.lang,"ThreadDeath",Error);
declareType(java.lang,"UnknownError",VirtualMachineError);
declareType(java.lang,"UnsatisfiedLinkError",LinkageError);
declareType(java.lang,"UnsupportedClassVersionError",ClassFormatError);
declareType(java.lang,"UnsupportedOperationException",RuntimeException);
declareType(java.lang,"VerifyError",LinkageError);

declareType(java.lang,"ClassCastException",RuntimeException);

C$=Clazz.newClass$(java.lang,"ClassNotFoundException",function(){this.ex=null;},Exception);
m$(C$, "c$$S$Throwable", function(detailMessage,exception){
C$.superClazz.c$$S$Throwable.apply(this, arguments);
this.ex=exception;
}, 1);
m$(C$,"getException",
function(){
return this.ex;
});
m$(C$,"getCause",
function(){
return this.ex;
});

C$=declareType(java.lang,"StringIndexOutOfBoundsException",IndexOutOfBoundsException);
m$(C$, "c$$I", function(index){
C$.superClazz.c$$S.apply(this,["String index out of range: "+index]);
}, 1);

C$=Clazz.newClass$(java.lang.reflect,"InvocationTargetException",function(){this.target=null;},Exception);
m$(C$, "c$$Throwable", function(exception){
C$.superClazz.c$$Throwable.apply(this, arguments);
this.target=exception;
}, 1);
m$(C$, "c$$Throwable$S", function(exception,detailMessage){
C$.superClazz.c$$S$Throwable.apply(this,[detailMessage,exception]);
this.target=exception;
}, 1);
m$(C$,"getTargetException",
function(){
return this.target;
});
m$(C$,"getCause",
function(){
return this.target;
});

C$=Clazz.newClass$(java.lang.reflect,"UndeclaredThrowableException",function(){this.undeclaredThrowable=null;},RuntimeException);
m$(C$, "c$$Throwable", function(exception){
C$.superClazz.c$$Throwable.apply(this, arguments);
this.undeclaredThrowable=exception;
this.initCause(exception);
},1);

m$(C$, "c$$Throwable$S", function(exception,detailMessage){
C$.superClazz.c$$S.apply(this,[detailMessage]);
this.undeclaredThrowable=exception;
this.initCause(exception);
},1);

m$(C$,"getUndeclaredThrowable",
function(){
return this.undeclaredThrowable;
});
m$(C$,"getCause",
function(){
return this.undeclaredThrowable;
});

declareType(java.io,"IOException",Exception);
declareType(java.io,"CharConversionException",java.io.IOException);
declareType(java.io,"EOFException",java.io.IOException);
declareType(java.io,"FileNotFoundException",java.io.IOException);
declareType(java.io,"ObjectStreamException",java.io.IOException);
declareType(java.io,"SyncFailedException",java.io.IOException);
declareType(java.io,"UnsupportedEncodingException",java.io.IOException);
declareType(java.io,"UTFDataFormatException",java.io.IOException);

declareType(java.io,"InvalidObjectException",java.io.ObjectStreamException);
declareType(java.io,"NotActiveException",java.io.ObjectStreamException);
declareType(java.io,"NotSerializableException",java.io.ObjectStreamException);
declareType(java.io,"StreamCorruptedException",java.io.ObjectStreamException);

C$=Clazz.newClass$(java.io,"InterruptedIOException",function(){
this.bytesTransferred=0;
},java.io.IOException);

C$=Clazz.newClass$(java.io,"InvalidClassException",function(){
this.classname=null;
},java.io.ObjectStreamException);

m$(C$, "c$$S$S", function(className,detailMessage){
C$.superClazz.c$$S.apply(this,[detailMessage]);
this.classname=className;
},1);

m$(C$,"getMessage",
function(){
var msg=C$.superClazz.getMessage.apply(this, []);
if(this.classname!=null){
msg=this.classname+';' + ' '+msg;
}return msg;
});

C$=Clazz.newClass$(java.io,"OptionalDataException",function(){
this.eof=false;
this.length=0;
},java.io.ObjectStreamException);

C$=Clazz.newClass$(java.io,"WriteAbortedException",function(){
this.detail=null;
},java.io.ObjectStreamException);

m$(C$, "c$$S$Throwable", function(detailMessage, rootCause){
C$.superClazz.c$$S.apply(this,[detailMessage]);
this.detail=rootCause;
this.initCause(rootCause);
}, 1);

m$(C$,"getMessage",
function(){
var msg=C$.superClazz.getMessage.apply(this);
return (this.detail ? msg + "; "+this.detail.toString() : msg);
});
m$(C$,"getCause",
function(){
return this.detail;
});

declareType(java.util,"EmptyStackException",RuntimeException);
declareType(java.util,"NoSuchElementException",RuntimeException);
declareType(java.util,"TooManyListenersException",Exception);

C$=declareType(java.util,"ConcurrentModificationException",RuntimeException);
m$(C$, "c$", function(detailMessage, rootCause){
Clazz.super(C$, this);
}, 1);

C$=Clazz.newClass$(java.util,"MissingResourceException",function(){
this.className=null;
this.key=null;
},RuntimeException);
m$(C$, "c$$S$S$S", function(detailMessage,className,resourceName){
C$.superClazz.c$$S.apply(this,[detailMessage]);
this.className=className;
this.key=resourceName;
}, 1);
m$(C$,"getClassName",
function(){
return this.className;
});
m$(C$,"getKey",
function(){
return this.key;
});

declareType(java.lang,"Void");
setJ2STypeclass(java.lang.Void, "void", "V");
//java.lang.Void.TYPE=java.lang.Void;
//java.lang.V

Clazz.newInterface$(java.lang.reflect,"GenericDeclaration");
Clazz.newInterface$(java.lang.reflect,"AnnotatedElement");

C$=declareType(java.lang.reflect,"AccessibleObject",null,java.lang.reflect.AnnotatedElement);
m$(C$, "c$",function(){
}, 1);
m$(C$,"isAccessible",
function(){
return false;
});
m$(C$,"setAccessible",
function(objects,flag){
return;
},1);
m$(C$,"setAccessible",
function(flag){
return;
});
m$(C$,"isAnnotationPresent",
function(annotationType){
return false;
});
m$(C$,"getDeclaredAnnotations",
function(){
return new Array(0);
});
m$(C$,"getAnnotations",
function(){
return new Array(0);
});
m$(C$,"getAnnotation",
function(annotationType){
return null;
});
m$(C$,"marshallArguments",
function(parameterTypes,args){
return null;
}, 1);
m$(C$,"invokeV",
function(receiver,args){
return;
});
m$(C$,"invokeL",
function(receiver,args){
return null;
});
m$(C$,"invokeI",
function(receiver,args){
return 0;
});
m$(C$,"invokeJ",
function(receiver,args){
return 0;
});
m$(C$,"invokeF",
function(receiver,args){
return 0.0;
});
m$(C$,"invokeD",
function(receiver,args){
return 0.0;
});
C$.emptyArgs=C$.prototype.emptyArgs=new Array(0);
Clazz.newInterface$(java.lang.reflect,"InvocationHandler");
C$=Clazz.newInterface$(java.lang.reflect,"Member");

C$=declareType(java.lang.reflect,"Modifier");
m$(C$, "c$", function(){}, 1);

m$(C$,"isAbstract",
function(modifiers){
return((modifiers&1024)!=0);
}, 1);
m$(C$,"isFinal",
function(modifiers){
return((modifiers&16)!=0);
}, 1);
m$(C$,"isInterface",
function(modifiers){
return((modifiers&512)!=0);
}, 1);
m$(C$,"isNative",
function(modifiers){
return((modifiers&256)!=0);
}, 1);
m$(C$,"isPrivate",
function(modifiers){
return((modifiers&2)!=0);
}, 1);
m$(C$,"isProtected",
function(modifiers){
return((modifiers&4)!=0);
}, 1);
m$(C$,"isPublic",
function(modifiers){
return((modifiers&1)!=0);
}, 1);
m$(C$,"isStatic",
function(modifiers){
return((modifiers&8)!=0);
}, 1);
m$(C$,"isStrict",
function(modifiers){
return((modifiers&2048)!=0);
}, 1);
m$(C$,"isSynchronized",
function(modifiers){
return((modifiers&32)!=0);
}, 1);
m$(C$,"isTransient",
function(modifiers){
return((modifiers&128)!=0);
}, 1);
m$(C$,"isVolatile",
function(modifiers){
return((modifiers&64)!=0);
}, 1);
m$(C$,"toString",
function(modifiers){
var sb=new Array(0);
if(java.lang.reflect.Modifier.isPublic(modifiers))sb[sb.length]="public";
if(java.lang.reflect.Modifier.isProtected(modifiers))sb[sb.length]="protected";
if(java.lang.reflect.Modifier.isPrivate(modifiers))sb[sb.length]="private";
if(java.lang.reflect.Modifier.isAbstract(modifiers))sb[sb.length]="abstract";
if(java.lang.reflect.Modifier.isStatic(modifiers))sb[sb.length]="static";
if(java.lang.reflect.Modifier.isFinal(modifiers))sb[sb.length]="final";
if(java.lang.reflect.Modifier.isTransient(modifiers))sb[sb.length]="transient";
if(java.lang.reflect.Modifier.isVolatile(modifiers))sb[sb.length]="volatile";
if(java.lang.reflect.Modifier.isSynchronized(modifiers))sb[sb.length]="synchronized";
if(java.lang.reflect.Modifier.isNative(modifiers))sb[sb.length]="native";
if(java.lang.reflect.Modifier.isStrict(modifiers))sb[sb.length]="strictfp";
if(java.lang.reflect.Modifier.isInterface(modifiers))sb[sb.length]="interface";
if(sb.length>0){
return sb.join(" ");
}return"";
}, 1);

var newMethodNotFoundException = function (clazz, method) {
  var message = "Method " + getClassName(clazz, true) + (method ? "." 
          + method : "") + " was not found";
  System.out.println(message);
  console.log(message);
  throw Clazz.new(java.lang.NoSuchMethodException.c$$S, [message]);        
};

C$=Clazz.newClass$(java.lang.reflect,"Constructor",function(){
this.Class_=null;
this.parameterTypes=null;
this.exceptionTypes=null;
this.modifiers=0;
this.signature="c$";
this.constr = null;
},java.lang.reflect.AccessibleObject,[java.lang.reflect.GenericDeclaration,java.lang.reflect.Member]);

m$(C$, "c$$Class$ClassA$ClassA$I", function(declaringClass,parameterTypes,checkedExceptions,modifiers){
Clazz.super(C$, this);
this.Class_=declaringClass;
this.parameterTypes=parameterTypes;
if (parameterTypes != null)
for (var i = 0; i < parameterTypes.length; i++) {
   this.signature += "$" + Clazz._getParamCode(parameterTypes[i]);
} 
this.constr = this.Class_.$clazz$[this.signature];
this.exceptionTypes=checkedExceptions;
this.modifiers=modifiers;
}, 1);
m$(C$,"getTypeParameters",
function(){
return null;
});
m$(C$,"toGenericString",
function(){
return null;
});
m$(C$,"getGenericParameterTypes",
function(){
return null;
});
m$(C$,"getGenericExceptionTypes",
function(){
return null;
});
m$(C$,"getParameterAnnotations",
function(){
return null;
});
m$(C$,"isVarArgs",
function(){
return false;
});
m$(C$,"isSynthetic",
function(){
return false;
});
m$(C$,"equals$O",
function(object){
if(object!=null&&Clazz.instanceOf(object,java.lang.reflect.Constructor)){
var other=object;
if(this.getDeclaringClass()===other.getDeclaringClass()){
var params1=this.parameterTypes;
var params2=other.parameterTypes;
if(params1.length==params2.length){
for(var i=0;i<params1.length;i++){
if(params1[i]!==params2[i])return false;
}
return true;
}}}return false;
});
m$(C$,"getDeclaringClass",
function(){
return this.Class_;
});
m$(C$,"getExceptionTypes",
function(){
return this.exceptionTypes;
});
m$(C$,"getModifiers",
function(){
return this.modifiers;
});
m$(C$,"getName",
function(){
return this.getDeclaringClass().getName();
});
m$(C$,"getParameterTypes",
function(){
return this.parameterTypes;
});
m$(C$,"hashCode",
function(){
return this.getDeclaringClass().getName().hashCode();
});
m$(C$,"newInstance$OA", function(args){
  var instance = null;
  if (this.constr) {
    var a = (args ? new Array(args.length) : null);
    if (args) {
      for (var i = args.length; --i >= 0;) {
        a[i] = (this.parameterTypes[i].__PRIMITIVE ? args[i].valueOf() : args[i]);
      }
    }
    var instance = Clazz.new(this.constr, a);
  }
//  var instance=new this.clazz(null, Clazz.inheritArgs);
  if (instance == null)
    newMethodNotFoundException(this.Class_.$clazz$, this.signature);  
  return instance;
});
m$(C$,"toString",
function(){
return null;
});

C$=declareType(java.lang.reflect,"Field",java.lang.reflect.AccessibleObject,java.lang.reflect.Member);
m$(C$,"isSynthetic",
function(){
return false;
});
m$(C$,"toGenericString",
function(){
return null;
});
m$(C$,"isEnumConstant",
function(){
return false;
});
m$(C$,"getGenericType",
function(){
return null;
});
m$(C$,"equals$O",
function(object){
return false;
});
m$(C$,"getDeclaringClass",
function(){
return null;
});
m$(C$,"getName",
function(){
return null;
});
m$(C$,"getType",
function(){
return null;
});
m$(C$,"hashCode",
function(){
return 0;
});
m$(C$,"toString",
function(){
return null;
});

C$=Clazz.newClass$(java.lang.reflect,"Method",function(){
this.Class_=null;
this.name=null;
this.returnType=null;
this.parameterTypes=null;
this.exceptionTypes=null;
this.modifiers=0;
},java.lang.reflect.AccessibleObject,[java.lang.reflect.GenericDeclaration,java.lang.reflect.Member]);
m$(C$, "c$$Class$S$ClassA$Class$ClassA$I", function(declaringClass,name,parameterTypes,returnType,checkedExceptions,modifiers){
Clazz.super(C$, this);
this.Class_=declaringClass;
this.name=name;
this.parameterTypes=parameterTypes;
this.returnType=returnType;
this.exceptionTypes=checkedExceptions;
this.modifiers=modifiers;
}, 1);
m$(C$,"getTypeParameters",
function(){
return null;
});
m$(C$,"toGenericString",
function(){
return null;
});
m$(C$,"getGenericParameterTypes",
function(){
return null;
});
m$(C$,"getGenericExceptionTypes",
function(){
return null;
});
m$(C$,"getGenericReturnType",
function(){
return null;
});
m$(C$,"getParameterAnnotations",
function(){
return null;
});
m$(C$,"isVarArgs",
function(){
return false;
});
m$(C$,"isBridge",
function(){
return false;
});
m$(C$,"isSynthetic",
function(){
return false;
});
m$(C$,"getDefaultValue",
function(){
return null;
});
m$(C$,"equals$O",
function(object){
if(object!=null&&Clazz.instanceOf(object,java.lang.reflect.Method)){
var other=object;
if((this.getDeclaringClass()===other.getDeclaringClass())&&(this.getName()===other.getName())){
var params1=this.parameterTypes;
var params2=other.parameterTypes;
if(params1.length==params2.length){
for(var i=0;i<params1.length;i++){
if(params1[i]!==params2[i])return false;
}
return true;
}}}return false;
});
m$(C$,"getDeclaringClass",
function(){
return this.Class_;
});
m$(C$,"getExceptionTypes",
function(){
return this.exceptionTypes;
});
m$(C$,"getModifiers",
function(){
return this.modifiers;
});
m$(C$,"getName",
function(){
return this.name;
});
m$(C$,"getParameterTypes",
function(){
return this.parameterTypes; 
});
m$(C$,"getReturnType",
function(){
return this.returnType;
});
m$(C$,"hashCode",
function(){
return this.getDeclaringClass().getName().hashCode()^this.getName().hashCode();
});
m$(C$,"invoke$O$OA",
function(receiver,args){
var name = this.getName();
var types = this.parameterTypes;
var a = (types == null ? null : new Array(args.length));

if (types != null)
for (var i = 0; i < types.length; i++) {
  var t = types[i];
  var paramCode = Clazz._getParamCode(t);
  a[i] = (t.__PRIMITIVE && args[i].valueOf ? args[i].valueOf() : args[i]);
  name += "$" + paramCode;
}
var c = this.Class_.$clazz$;
var m=c.prototype[name] || c[name];
if (m == null)
  newMethodNotFoundException(c, name);  
return m.apply(receiver,a);
});
m$(C$,"toString",
function(){
return null;
});

  if (needPackage("core"))
    _Loader.loadPackage("core");  

//Clazz._Loader.loadZJar(Clazz._Loader.getJ2SLibBase() + "core/coreswingjs.z.js", "swingjs.JSUtil");



})(Clazz, J2S); // requires JSmolCore.js

}; // called by external application 


