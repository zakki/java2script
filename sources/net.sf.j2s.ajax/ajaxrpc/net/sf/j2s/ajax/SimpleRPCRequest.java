/*******************************************************************************
 * Java2Script Pacemaker (http://j2s.sourceforge.net)
 *
 * Copyright (c) 2006 ognize.com and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     ognize.com - initial API and implementation
 *******************************************************************************/

package net.sf.j2s.ajax;

/**
 * @author josson smith
 *
 * 2006-10-10
 */
public class SimpleRPCRequest {
	
	public static int MODE_AJAX = 1;
	public static int MODE_LOCAL_JAVA_THREAD = 2;
	
	static int runningMode = MODE_LOCAL_JAVA_THREAD;
	
	public static void switchToAJAXMode() {
		runningMode = MODE_AJAX;
	}
	
	/**
	 * This method only makes sense for Java client not for
	 * Java2Script client!
	 */
	public static void switchToLocalJavaThreadMode() {
		runningMode = MODE_LOCAL_JAVA_THREAD;
	}
	
	/**
	 * Java2Script client will always requests in AJAX mode. 
	 * @param runnable
	 * @j2sNative
	 * runnable.ajaxIn ();
	 * net.sf.j2s.ajax.SimpleRPCRequest.ajaxRequest (runnable);
	 */
	public static void request(SimpleRPCRunnable runnable) {
		runnable.ajaxIn();
		if (runningMode == MODE_LOCAL_JAVA_THREAD) {
			new Thread(runnable).start();
		} else {
			ajaxRequest(runnable);
		}
	}
	
	static String getClassNameURL(SimpleRPCRunnable runnable) {
		Class oClass = runnable.getClass();
		String name = oClass.getName();
		while (name.indexOf('$') != -1) {
			oClass = oClass.getSuperclass();
			if (oClass == null) {
				return null; // should never happen!
			}
			name = oClass.getName();
		}
		return name;
	}

	private static void ajaxRequest(final SimpleRPCRunnable runnable) {
		String url = runnable.getHttpURL();
		String method = runnable.getHttpMethod();
		String serialize = runnable.serialize();
		if (method == null) {
			method = "POST";
		}
		if (checkXSS(url, serialize, runnable)) {
			return;
		}
		final HttpRequest request = new HttpRequest();
		request.open(method, url, true);
		request.registerOnReadyStateChange(new XHRCallbackAdapter() {
			public void onLoaded() {
				String responseText = request.getResponseText();
				if (responseText == null || responseText.length() == 0) {
					runnable.ajaxFail(); // should seldom fail!
					return;
				}
				runnable.deserialize(responseText);
				runnable.ajaxOut();
			}
		});
		request.send(serialize);
	}

	/**
	 * Check cross site script. Only make senses for JavaScript.
	 * 
	 * @param url
	 * @param serialize
	 * @param runnable
	 * @return
	 */
	protected static boolean checkXSS(String url, String serialize, SimpleRPCRunnable runnable) {
		/**
		 * @j2sNative
 if (url != null && (url.indexOf ("http://") == 0
 		|| url.indexOf ("https://") == 0)) {
 	var host = null;
 	var idx = url.indexOf ('/', 9);
 	if (idx != -1) {
 		host = url.substring (url.indexOf ("//") + 2, idx); 
 	} else {
 		host = url.substring (url.indexOf ("//") + 2); 
 	}
 	if (window.location.host != host || window.location.protocol == "file:") {
 		var g = net.sf.j2s.ajax.SimpleRPCRequest;
 		if (g.idSet == null) {
 			g.idSet = new Object ();
 		}
 		var rnd = null;
 		while (true) {
 			var rnd = Math.random () + "0000000.*";
 			rnd = rnd.substring (2, 8);
 			if (g.idSet["o" + rnd] == null) {
 				g.idSet["o" + rnd] = runnable;
 				break;
 			}
 		}
 		var limit = 7168; //8192;
 		if (window["script.get.url.limit"] != null) {
 			limit = window["script.get.url.limit"]; 
 		}
 		var ua = navigator.userAgent.toLowerCase ();
 		if (ua.indexOf ("msie")!=-1 && ua.indexOf ("opera") == -1){
 			limit = 2048;
 		}
 		limit -= url.length + 36; // 5 + 6 + 5 + 2 + 5 + 2 + 5;
 		var contents = [];
 		var content = encodeURIComponent(serialize);
		if (content.length > limit) {
			parts = Math.ceil (content.length / limit);
			var lastEnd = 0;
			for (var i = 0; i < parts; i++) {
				var end = (i + 1) * limit;
				if (end > content.length) {
					end = content.length;
				} else {
					for (var j = 0; j < 3; j++) {
						var ch = content.charAt (end - j);
						if (ch == '%') {
							end -= j;
							break;
						}
					}
				}
				contents[i] = content.substring (lastEnd, end);
				lastEnd = end; 
			}
		} else {
			contents[0] = content;
		}
 		for (var i = 0; i < contents.length; i++) {
 			var script = document.createElement ("SCRIPT");
 			script.type = "text/javascript";
 			script.src = url + "?jzn=" + rnd + "&jzp=" + contents.length 
 					+ "&jzc=" + (i + 1) + "&jzz=" + contents[i];
 			if (typeof (script.onreadystatechange) == "undefined") { // W3C
	 			script.onerror = function () {
	 				this.onerror = null;
	 				var idx = this.src.indexOf ("jzn=");
	 				var rid = this.src.substring (idx + 4, this.src.indexOf ("&", idx));
	 				net.sf.j2s.ajax.SimpleRPCRequest.xssNotify (rid, null);
	 				document.getElementsByTagName ("HEAD")[0].removeChild (this);
	 			};
	 			script.onload = function () {
	 				this.onload = null;
	 				if (navigator.userAgent.indexOf ("Opera") >= 0) {
	 					var idx = this.src.indexOf ("jzn=");
	 					var rid = this.src.substring (idx + 4, this.src.indexOf ("&", idx));
	 					net.sf.j2s.ajax.SimpleRPCRequest.xssNotify (rid, null);
 					}
 					document.getElementsByTagName ("HEAD")[0].removeChild (this);
 				};
	 		} else { // IE
				script.defer = true;
				script.onreadystatechange = function () {
					var state = "" + this.readyState;
					if (state == "loaded" || state == "complete") {
						this.onreadystatechange = null; 
		 				var idx = this.src.indexOf ("jzn=");
		 				var rid = this.src.substring (idx + 4, this.src.indexOf ("&", idx));
		 				net.sf.j2s.ajax.SimpleRPCRequest.xssNotify (rid, null);
	 					document.getElementsByTagName ("HEAD")[0].removeChild (this);
					}
				};
	 		}
 			var head = document.getElementsByTagName ("HEAD")[0];
 			head.appendChild (script);
 		}  
 		return true; // cross site script!
 	}
 }
		 */ { }
		 return false;
	}
	
	/**
	 * Cross site script notify. Only make senses for JavaScript.
	 * 
	 * @param nameID
	 * @param response
	 */
	static void xssNotify(String nameID, String response) {
		/**
		 * @j2sNative
var ua = navigator.userAgent.toLowerCase ();
if (response != null && ua.indexOf ("msie") != -1 && ua.indexOf ("opera") == -1) {
	var ss = document.getElementsByTagName ("SCRIPT");
	for (var i = 0; i < ss.length; i++) {
		var s = ss[i];
		if (s.src != null && s.src.indexOf ("jzn=" + nameID) != -1
				&& s.readyState == "interactive") {
 			s.onreadystatechange =  function () {
				var state = "" + this.readyState;
				if (state == "loaded" || state == "complete") {
					this.onreadystatechange = null; 
 					document.getElementsByTagName ("HEAD")[0].removeChild (this);
				}
			};
	 	}
	}
}
		 */ { }
		if (response == "continue") return;
		SimpleRPCRunnable runnable = null;
		/**
		 * @j2sNative
var g = net.sf.j2s.ajax.SimpleRPCRequest;
runnable = g.idSet["o" + nameID];
g.idSet["o" + nameID] = null;
if (response == null && runnable != null) { // error!
	runnable.ajaxFail();
	return;
}
		 */ {}
		if (response == "unsupported") {
			if (runnable != null) {
				runnable.ajaxFail();
			} else {
				System.err.println("[Java2Script] Sever error: Remote server does not support cross site script!");
			}
			return;
		}
		if (runnable != null) {
			runnable.deserialize(response);
			runnable.ajaxOut();
		}
	}
}
