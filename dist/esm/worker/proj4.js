!function (t, s) { "object" == typeof exports && "undefined" != typeof module ? module.exports = s() : "function" == typeof define && define.amd ? define(s) : t.proj4 = s(); }(globalThis, function () {
    "use strict";
    function t(t, s) { if (t[s])
        return t[s]; for (var i, a = Object.keys(t), h = s.toLowerCase().replace(Lt, ""), e = -1; ++e < a.length;)
        if (i = a[e], i.toLowerCase().replace(Lt, "") === h)
            return t[i]; }
    function s(t) { if ("string" != typeof t)
        throw new Error("not a string"); this.text = t.trim(), this.level = 0, this.place = 0, this.root = null, this.stack = [], this.currentObject = null, this.state = jt; }
    function i(t) { return new s(t).output(); }
    function a(t, s, i) { Array.isArray(s) && (i.unshift(s), s = null); var a = s ? {} : t, e = i.reduce(function (t, s) { return h(s, t), t; }, a); s && (t[s] = e); }
    function h(t, s) { if (Array.isArray(t)) {
        var i = t.shift();
        if ("PARAMETER" === i && (i = t.shift()), 1 === t.length)
            return Array.isArray(t[0]) ? (s[i] = {}, void h(t[0], s[i])) : void (s[i] = t[0]);
        if (t.length)
            if ("TOWGS84" !== i) {
                if ("AXIS" === i)
                    return i in s || (s[i] = []), void s[i].push(t);
                Array.isArray(i) || (s[i] = {});
                var e;
                switch (i) {
                    case "UNIT":
                    case "PRIMEM":
                    case "VERT_DATUM": return s[i] = { name: t[0].toLowerCase(), convert: t[1] }, void (3 === t.length && h(t[2], s[i]));
                    case "SPHEROID":
                    case "ELLIPSOID": return s[i] = { name: t[0], a: t[1], rf: t[2] }, void (4 === t.length && h(t[3], s[i]));
                    case "PROJECTEDCRS":
                    case "PROJCRS":
                    case "GEOGCS":
                    case "GEOCCS":
                    case "PROJCS":
                    case "LOCAL_CS":
                    case "GEODCRS":
                    case "GEODETICCRS":
                    case "GEODETICDATUM":
                    case "EDATUM":
                    case "ENGINEERINGDATUM":
                    case "VERT_CS":
                    case "VERTCRS":
                    case "VERTICALCRS":
                    case "COMPD_CS":
                    case "COMPOUNDCRS":
                    case "ENGINEERINGCRS":
                    case "ENGCRS":
                    case "FITTED_CS":
                    case "LOCAL_DATUM":
                    case "DATUM": return t[0] = ["name", t[0]], void a(s, i, t);
                    default:
                        for (e = -1; ++e < t.length;)
                            if (!Array.isArray(t[e]))
                                return h(t, s[i]);
                        return a(s, i, t);
                }
            }
            else
                s[i] = t;
        else
            s[i] = !0;
    }
    else
        s[t] = !0; }
    function e(t, s) { var i = s[0], a = s[1]; !(i in t) && a in t && (t[i] = t[a], 3 === s.length && (t[i] = s[2](t[i]))); }
    function n(t) { return t * Ut; }
    function r(t) { function s(s) { return s * (t.to_meter || 1); } if ("GEOGCS" === t.type ? t.projName = "longlat" : "LOCAL_CS" === t.type ? (t.projName = "identity", t.local = !0) : "object" == typeof t.PROJECTION ? t.projName = Object.keys(t.PROJECTION)[0] : t.projName = t.PROJECTION, t.AXIS) {
        for (var i = "", a = 0, h = t.AXIS.length; a < h; ++a) {
            var r = [t.AXIS[a][0].toLowerCase(), t.AXIS[a][1].toLowerCase()];
            -1 !== r[0].indexOf("north") || ("y" === r[0] || "lat" === r[0]) && "north" === r[1] ? i += "n" : -1 !== r[0].indexOf("south") || ("y" === r[0] || "lat" === r[0]) && "south" === r[1] ? i += "s" : -1 !== r[0].indexOf("east") || ("x" === r[0] || "lon" === r[0]) && "east" === r[1] ? i += "e" : -1 === r[0].indexOf("west") && ("x" !== r[0] && "lon" !== r[0] || "west" !== r[1]) || (i += "w");
        }
        2 === i.length && (i += "u"), 3 === i.length && (t.axis = i);
    } t.UNIT && (t.units = t.UNIT.name.toLowerCase(), "metre" === t.units && (t.units = "meter"), t.UNIT.convert && ("GEOGCS" === t.type ? t.DATUM && t.DATUM.SPHEROID && (t.to_meter = t.UNIT.convert * t.DATUM.SPHEROID.a) : t.to_meter = t.UNIT.convert)); var o = t.GEOGCS; "GEOGCS" === t.type && (o = t), o && (o.DATUM ? t.datumCode = o.DATUM.name.toLowerCase() : t.datumCode = o.name.toLowerCase(), "d_" === t.datumCode.slice(0, 2) && (t.datumCode = t.datumCode.slice(2)), "new_zealand_geodetic_datum_1949" !== t.datumCode && "new_zealand_1949" !== t.datumCode || (t.datumCode = "nzgd49"), "wgs_1984" !== t.datumCode && "world_geodetic_system_1984" !== t.datumCode || ("Mercator_Auxiliary_Sphere" === t.PROJECTION && (t.sphere = !0), t.datumCode = "wgs84"), "_ferro" === t.datumCode.slice(-6) && (t.datumCode = t.datumCode.slice(0, -6)), "_jakarta" === t.datumCode.slice(-8) && (t.datumCode = t.datumCode.slice(0, -8)), ~t.datumCode.indexOf("belge") && (t.datumCode = "rnb72"), o.DATUM && o.DATUM.SPHEROID && (t.ellps = o.DATUM.SPHEROID.name.replace("_19", "").replace(/[Cc]larke\_18/, "clrk"), "international" === t.ellps.toLowerCase().slice(0, 13) && (t.ellps = "intl"), t.a = o.DATUM.SPHEROID.a, t.rf = parseFloat(o.DATUM.SPHEROID.rf, 10)), o.DATUM && o.DATUM.TOWGS84 && (t.datum_params = o.DATUM.TOWGS84), ~t.datumCode.indexOf("osgb_1936") && (t.datumCode = "osgb36"), ~t.datumCode.indexOf("osni_1952") && (t.datumCode = "osni52"), (~t.datumCode.indexOf("tm65") || ~t.datumCode.indexOf("geodetic_datum_of_1965")) && (t.datumCode = "ire65"), "ch1903+" === t.datumCode && (t.datumCode = "ch1903"), ~t.datumCode.indexOf("israel") && (t.datumCode = "isr93")), t.b && !isFinite(t.b) && (t.b = t.a); [["standard_parallel_1", "Standard_Parallel_1"], ["standard_parallel_1", "Latitude of 1st standard parallel"], ["standard_parallel_2", "Standard_Parallel_2"], ["standard_parallel_2", "Latitude of 2nd standard parallel"], ["false_easting", "False_Easting"], ["false_easting", "False easting"], ["false-easting", "Easting at false origin"], ["false_northing", "False_Northing"], ["false_northing", "False northing"], ["false_northing", "Northing at false origin"], ["central_meridian", "Central_Meridian"], ["central_meridian", "Longitude of natural origin"], ["central_meridian", "Longitude of false origin"], ["latitude_of_origin", "Latitude_Of_Origin"], ["latitude_of_origin", "Central_Parallel"], ["latitude_of_origin", "Latitude of natural origin"], ["latitude_of_origin", "Latitude of false origin"], ["scale_factor", "Scale_Factor"], ["k0", "scale_factor"], ["latitude_of_center", "Latitude_Of_Center"], ["latitude_of_center", "Latitude_of_center"], ["lat0", "latitude_of_center", n], ["longitude_of_center", "Longitude_Of_Center"], ["longitude_of_center", "Longitude_of_center"], ["longc", "longitude_of_center", n], ["x0", "false_easting", s], ["y0", "false_northing", s], ["long0", "central_meridian", n], ["lat0", "latitude_of_origin", n], ["lat0", "standard_parallel_1", n], ["lat1", "standard_parallel_1", n], ["lat2", "standard_parallel_2", n], ["azimuth", "Azimuth"], ["alpha", "azimuth", n], ["srsCode", "name"]].forEach(function (s) { return e(t, s); }), t.long0 || !t.longc || "Albers_Conic_Equal_Area" !== t.projName && "Lambert_Azimuthal_Equal_Area" !== t.projName || (t.long0 = t.longc), t.lat_ts || !t.lat1 || "Stereographic_South_Pole" !== t.projName && "Polar Stereographic (variant B)" !== t.projName ? !t.lat_ts && t.lat0 && "Polar_Stereographic" === t.projName && (t.lat_ts = t.lat0, t.lat0 = n(t.lat0 > 0 ? 90 : -90)) : (t.lat0 = n(t.lat1 > 0 ? 90 : -90), t.lat_ts = t.lat1); }
    function o(t) { var s = this; if (2 === arguments.length) {
        var i = arguments[1];
        "string" == typeof i ? "+" === i.charAt(0) ? o[t] = Gt(arguments[1]) : o[t] = Qt(arguments[1]) : o[t] = i;
    }
    else if (1 === arguments.length) {
        if (Array.isArray(t))
            return t.map(function (t) { Array.isArray(t) ? o.apply(s, t) : o(t); });
        if ("string" == typeof t) {
            if (t in o)
                return o[t];
        }
        else
            "EPSG" in t ? o["EPSG:" + t.EPSG] = t : "ESRI" in t ? o["ESRI:" + t.ESRI] = t : "IAU2000" in t ? o["IAU2000:" + t.IAU2000] = t : console.log(t);
        return;
    } }
    function l(t) { return "string" == typeof t; }
    function u(t) { return t in o; }
    function c(t) { return Wt.some(function (s) { return t.indexOf(s) > -1; }); }
    function M(s) { var i = t(s, "authority"); if (i) {
        var a = t(i, "epsg");
        return a && Ht.indexOf(a) > -1;
    } }
    function f(s) { var i = t(s, "extension"); if (i)
        return t(i, "proj4"); }
    function d(t) { return "+" === t[0]; }
    function m(t) { if (!l(t))
        return t; if (u(t))
        return o[t]; if (c(t)) {
        var s = Qt(t);
        if (M(s))
            return o["EPSG:3857"];
        var i = f(s);
        return i ? Gt(i) : s;
    } return d(t) ? Gt(t) : void 0; }
    function p(t) { return t; }
    function y(t, s) { var i = ss.length; return t.names ? (ss[i] = t, t.names.forEach(function (t) { ts[t.toLowerCase()] = i; }), this) : (console.log(s), !0); }
    function _(t, s, i, a) { var h = t * t, e = s * s, n = (h - e) / h, r = 0; return a ? (h = (t *= 1 - n * (Nt + n * (Et + n * At))) * t, n = 0) : r = Math.sqrt(n), { es: n, e: r, ep2: (h - e) / e }; }
    function x(s, i, a, h, e) { if (!s) {
        var n = t(as, h);
        n || (n = hs), s = n.a, i = n.b, a = n.rf;
    } return a && !i && (i = (1 - 1 / a) * s), (0 === a || Math.abs(s - i) < Ct) && (e = !0, i = s), { a: s, b: i, rf: a, sphere: e }; }
    function g(t, s, i, a, h, e, n) { var r = {}; return r.datum_type = void 0 === t || "none" === t ? vt : gt, s && (r.datum_params = s.map(parseFloat), 0 === r.datum_params[0] && 0 === r.datum_params[1] && 0 === r.datum_params[2] || (r.datum_type = yt), r.datum_params.length > 3 && (0 === r.datum_params[3] && 0 === r.datum_params[4] && 0 === r.datum_params[5] && 0 === r.datum_params[6] || (r.datum_type = _t, r.datum_params[3] *= bt, r.datum_params[4] *= bt, r.datum_params[5] *= bt, r.datum_params[6] = r.datum_params[6] / 1e6 + 1))), n && (r.datum_type = xt, r.grids = n), r.a = i, r.b = a, r.es = h, r.ep2 = e, r; }
    function v(t) { return void 0 === t ? null : t.split(",").map(b); }
    function b(t) { if (0 === t.length)
        return null; var s = "@" === t[0]; return s && (t = t.slice(1)), "null" === t ? { name: "null", mandatory: !s, grid: null, isNull: !0 } : { name: t, mandatory: !s, grid: os[t] || null, isNull: !1 }; }
    function w(t) { return t / 3600 * Math.PI / 180; }
    function N(t) { var s = t.getInt32(8, !1); return 11 !== s && (11 !== (s = t.getInt32(8, !0)) && console.warn("Failed to detect nadgrid endian-ness, defaulting to little-endian"), !0); }
    function E(t, s) { return { nFields: t.getInt32(8, s), nSubgridFields: t.getInt32(24, s), nSubgrids: t.getInt32(40, s), shiftType: A(t, 56, 64).trim(), fromSemiMajorAxis: t.getFloat64(120, s), fromSemiMinorAxis: t.getFloat64(136, s), toSemiMajorAxis: t.getFloat64(152, s), toSemiMinorAxis: t.getFloat64(168, s) }; }
    function A(t, s, i) { return String.fromCharCode.apply(null, new Uint8Array(t.buffer.slice(s, i))); }
    function C(t, s, i) { for (var a = 176, h = [], e = 0; e < s.nSubgrids; e++) {
        var n = S(t, a, i), r = I(t, a, n, i), o = Math.round(1 + (n.upperLongitude - n.lowerLongitude) / n.longitudeInterval), l = Math.round(1 + (n.upperLatitude - n.lowerLatitude) / n.latitudeInterval);
        h.push({ ll: [w(n.lowerLongitude), w(n.lowerLatitude)], del: [w(n.longitudeInterval), w(n.latitudeInterval)], lim: [o, l], count: n.gridNodeCount, cvs: P(r) }), a += 176 + 16 * n.gridNodeCount;
    } return h; }
    function P(t) { return t.map(function (t) { return [w(t.longitudeShift), w(t.latitudeShift)]; }); }
    function S(t, s, i) { return { name: A(t, s + 8, s + 16).trim(), parent: A(t, s + 24, s + 24 + 8).trim(), lowerLatitude: t.getFloat64(s + 72, i), upperLatitude: t.getFloat64(s + 88, i), lowerLongitude: t.getFloat64(s + 104, i), upperLongitude: t.getFloat64(s + 120, i), latitudeInterval: t.getFloat64(s + 136, i), longitudeInterval: t.getFloat64(s + 152, i), gridNodeCount: t.getInt32(s + 168, i) }; }
    function I(t, s, i, a) { for (var h = s + 176, e = [], n = 0; n < i.gridNodeCount; n++) {
        var r = { latitudeShift: t.getFloat32(h + 16 * n, a), longitudeShift: t.getFloat32(h + 16 * n + 4, a), latitudeAccuracy: t.getFloat32(h + 16 * n + 8, a), longitudeAccuracy: t.getFloat32(h + 16 * n + 12, a) };
        e.push(r);
    } return e; }
    function Projection(s, i) { if (!(this instanceof Projection))
        return new Projection(s); i = i || function (t) { if (t)
        throw t; }; var a = m(s); if ("object" == typeof a) {
        var h = Projection.projections.get(a.projName);
        if (h) {
            if (a.datumCode && "none" !== a.datumCode) {
                var e = t(es, a.datumCode);
                e && (a.datum_params = a.datum_params || (e.towgs84 ? e.towgs84.split(",") : null), a.ellps = e.ellipse, a.datumName = e.datumName ? e.datumName : a.datumCode);
            }
            a.k0 = a.k0 || 1, a.axis = a.axis || "enu", a.ellps = a.ellps || "wgs84", a.lat1 = a.lat1 || a.lat0;
            var n = x(a.a, a.b, a.rf, a.ellps, a.sphere), r = _(n.a, n.b, n.rf, a.R_A), o = v(a.nadgrids), l = a.datum || g(a.datumCode, a.datum_params, n.a, n.b, r.es, r.ep2, o);
            Xt(this, a), Xt(this, h), this.a = n.a, this.b = n.b, this.rf = n.rf, this.sphere = n.sphere, this.es = r.es, this.e = r.e, this.ep2 = r.ep2, this.datum = l, this.init(), i(null, this);
        }
        else
            i("Could not get projection name from: " + s);
    }
    else
        i("Could not parse to valid json: " + s); }
    function O(t, s) { return t.datum_type === s.datum_type && (!(t.a !== s.a || Math.abs(t.es - s.es) > 5e-11) && (t.datum_type === yt ? t.datum_params[0] === s.datum_params[0] && t.datum_params[1] === s.datum_params[1] && t.datum_params[2] === s.datum_params[2] : t.datum_type !== _t || t.datum_params[0] === s.datum_params[0] && t.datum_params[1] === s.datum_params[1] && t.datum_params[2] === s.datum_params[2] && t.datum_params[3] === s.datum_params[3] && t.datum_params[4] === s.datum_params[4] && t.datum_params[5] === s.datum_params[5] && t.datum_params[6] === s.datum_params[6])); }
    function k(t, s, i) { var a, h, e, n, r = t.x, o = t.y, l = t.z ? t.z : 0; if (o < -wt && o > -1.001 * wt)
        o = -wt;
    else if (o > wt && o < 1.001 * wt)
        o = wt;
    else {
        if (o < -wt)
            return { x: -1 / 0, y: -1 / 0, z: t.z };
        if (o > wt)
            return { x: 1 / 0, y: 1 / 0, z: t.z };
    } return r > Math.PI && (r -= 2 * Math.PI), h = Math.sin(o), n = Math.cos(o), e = h * h, a = i / Math.sqrt(1 - s * e), { x: (a + l) * n * Math.cos(r), y: (a + l) * n * Math.sin(r), z: (a * (1 - s) + l) * h }; }
    function q(t, s, i, a) { var h, e, n, r, o, l, u, c, M, f, d, m, p, y, _, x, g = t.x, v = t.y, b = t.z ? t.z : 0; if (h = Math.sqrt(g * g + v * v), e = Math.sqrt(g * g + v * v + b * b), h / i < 1e-12) {
        if (y = 0, e / i < 1e-12)
            return _ = wt, x = -a, { x: t.x, y: t.y, z: t.z };
    }
    else
        y = Math.atan2(v, g); n = b / e, c = (r = h / e) * (1 - s) * (o = 1 / Math.sqrt(1 - s * (2 - s) * r * r)), M = n * o, p = 0; do {
        p++, l = s * (u = i / Math.sqrt(1 - s * M * M)) / (u + (x = h * c + b * M - u * (1 - s * M * M))), m = (d = n * (o = 1 / Math.sqrt(1 - l * (2 - l) * r * r))) * c - (f = r * (1 - l) * o) * M, c = f, M = d;
    } while (m * m > 1e-24 && p < 30); return _ = Math.atan(d / Math.abs(f)), { x: y, y: _, z: x }; }
    function R(t, s, i) { if (s === yt)
        return { x: t.x + i[0], y: t.y + i[1], z: t.z + i[2] }; if (s === _t) {
        var a = i[0], h = i[1], e = i[2], n = i[3], r = i[4], o = i[5], l = i[6];
        return { x: l * (t.x - o * t.y + r * t.z) + a, y: l * (o * t.x + t.y - n * t.z) + h, z: l * (-r * t.x + n * t.y + t.z) + e };
    } }
    function L(t, s, i) { if (s === yt)
        return { x: t.x - i[0], y: t.y - i[1], z: t.z - i[2] }; if (s === _t) {
        var a = i[0], h = i[1], e = i[2], n = i[3], r = i[4], o = i[5], l = i[6], u = (t.x - a) / l, c = (t.y - h) / l, M = (t.z - e) / l;
        return { x: u + o * c - r * M, y: -o * u + c + n * M, z: r * u - n * c + M };
    } }
    function G(t) { return t === yt || t === _t; }
    function j(t, s, i) { if (null === t.grids || 0 === t.grids.length)
        return console.log("Grid shift grids not found"), -1; var a = { x: -i.x, y: i.y }, h = { x: Number.NaN, y: Number.NaN }, e = []; t: for (var n = 0; n < t.grids.length; n++) {
        var r = t.grids[n];
        if (e.push(r.name), r.isNull) {
            h = a;
            break;
        }
        if (null !== r.grid)
            for (var o = r.grid.subgrids, l = 0, u = o.length; l < u; l++) {
                var c = o[l], M = (Math.abs(c.del[1]) + Math.abs(c.del[0])) / 1e4, f = c.ll[0] - M, d = c.ll[1] - M, m = c.ll[0] + (c.lim[0] - 1) * c.del[0] + M, p = c.ll[1] + (c.lim[1] - 1) * c.del[1] + M;
                if (!(d > a.y || f > a.x || p < a.y || m < a.x) && (h = T(a, s, c), !isNaN(h.x)))
                    break t;
            }
        else if (r.mandatory)
            return console.log("Unable to find mandatory grid '" + r.name + "'"), -1;
    } return isNaN(h.x) ? (console.log("Failed to find a grid shift table for location '" + -a.x * St + " " + a.y * St + " tried: '" + e + "'"), -1) : (i.x = -h.x, i.y = h.y, 0); }
    function T(t, s, i) { var a = { x: Number.NaN, y: Number.NaN }; if (isNaN(t.x))
        return a; var h = { x: t.x, y: t.y }; h.x -= i.ll[0], h.y -= i.ll[1], h.x = Vt(h.x - Math.PI) + Math.PI; var e = B(h, i); if (s) {
        if (isNaN(e.x))
            return a;
        e.x = h.x - e.x, e.y = h.y - e.y;
        var n, r, o = 9;
        do {
            if (r = B(e, i), isNaN(r.x)) {
                console.log("Inverse grid shift iteration failed, presumably at grid edge.  Using first approximation.");
                break;
            }
            n = { x: h.x - (r.x + e.x), y: h.y - (r.y + e.y) }, e.x += n.x, e.y += n.y;
        } while (o-- && Math.abs(n.x) > 1e-12 && Math.abs(n.y) > 1e-12);
        if (o < 0)
            return console.log("Inverse grid shift iterator failed to converge."), a;
        a.x = Vt(e.x + i.ll[0]), a.y = e.y + i.ll[1];
    }
    else
        isNaN(e.x) || (a.x = t.x + e.x, a.y = t.y + e.y); return a; }
    function B(t, s) { var i, a = { x: t.x / s.del[0], y: t.y / s.del[1] }, h = { x: Math.floor(a.x), y: Math.floor(a.y) }, e = { x: a.x - 1 * h.x, y: a.y - 1 * h.y }, n = { x: Number.NaN, y: Number.NaN }; if (h.x < 0 || h.x >= s.lim[0])
        return n; if (h.y < 0 || h.y >= s.lim[1])
        return n; i = h.y * s.lim[0] + h.x; var r = { x: s.cvs[i][0], y: s.cvs[i][1] }; i++; var o = { x: s.cvs[i][0], y: s.cvs[i][1] }; i += s.lim[0]; var l = { x: s.cvs[i][0], y: s.cvs[i][1] }; i--; var u = { x: s.cvs[i][0], y: s.cvs[i][1] }, c = e.x * e.y, M = e.x * (1 - e.y), f = (1 - e.x) * (1 - e.y), d = (1 - e.x) * e.y; return n.x = f * r.x + M * o.x + d * u.x + c * l.x, n.y = f * r.y + M * o.y + d * u.y + c * l.y, n; }
    function z(t) { if ("function" == typeof Number.isFinite) {
        if (Number.isFinite(t))
            return;
        throw new TypeError("coordinates must be finite numbers");
    } if ("number" != typeof t || t !== t || !isFinite(t))
        throw new TypeError("coordinates must be finite numbers"); }
    function F(t, s) { return (t.datum.datum_type === yt || t.datum.datum_type === _t || t.datum.datum_type === xt) && "WGS84" !== s.datumCode || (s.datum.datum_type === yt || s.datum.datum_type === _t || s.datum.datum_type === xt) && "WGS84" !== t.datumCode; }
    function D(t, s, i, a) { var h, e = void 0 !== (i = Array.isArray(i) ? cs(i) : { x: i.x, y: i.y, z: i.z, m: i.m }).z; if (Ms(i), t.datum && s.datum && F(t, s) && (i = D(t, h = new Projection("WGS84"), i, a), t = h), a && "enu" !== t.axis && (i = us(t, !1, i)), "longlat" === t.projName)
        i = { x: i.x * Pt, y: i.y * Pt, z: i.z || 0 };
    else if (t.to_meter && (i = { x: i.x * t.to_meter, y: i.y * t.to_meter, z: i.z || 0 }), !(i = t.inverse(i)))
        return; if (t.from_greenwich && (i.x += t.from_greenwich), i = ls(t.datum, s.datum, i))
        return s.from_greenwich && (i = { x: i.x - s.from_greenwich, y: i.y, z: i.z || 0 }), "longlat" === s.projName ? i = { x: i.x * St, y: i.y * St, z: i.z || 0 } : (i = s.forward(i), s.to_meter && (i = { x: i.x / s.to_meter, y: i.y / s.to_meter, z: i.z || 0 })), a && "enu" !== s.axis ? us(s, !0, i) : (i && !e && delete i.z, i); }
    function U(t, s, i, a) { var h, e, n; return Array.isArray(i) ? (h = D(t, s, i, a) || { x: NaN, y: NaN }, i.length > 2 ? void 0 !== t.name && "geocent" === t.name || void 0 !== s.name && "geocent" === s.name ? "number" == typeof h.z ? [h.x, h.y, h.z].concat(i.slice(3)) : [h.x, h.y, i[2]].concat(i.slice(3)) : [h.x, h.y].concat(i.slice(2)) : [h.x, h.y]) : (e = D(t, s, i, a), 2 === (n = Object.keys(i)).length ? e : (n.forEach(function (a) { if (void 0 !== t.name && "geocent" === t.name || void 0 !== s.name && "geocent" === s.name) {
        if ("x" === a || "y" === a || "z" === a)
            return;
    }
    else if ("x" === a || "y" === a)
        return; e[a] = i[a]; }), e)); }
    function Q(t) { return t instanceof Projection ? t : t.oProj ? t.oProj : Projection(t); }
    function W(t, s, i) { t = Q(t); var a, h = !1; return void 0 === s ? (s = t, t = fs, h = !0) : (void 0 !== s.x || Array.isArray(s)) && (i = s, s = t, t = fs, h = !0), s = Q(s), i ? U(t, s, i) : (a = { forward: function (i, a) { return U(t, s, i, a); }, inverse: function (i, a) { return U(s, t, i, a); } }, h && (a.oProj = s), a); }
    function H(t, s) { return s = s || 5, $(V({ lat: t[1], lon: t[0] }), s); }
    function X(t) { var s = Z(at(t.toUpperCase())); return s.lat && s.lon ? [s.lon, s.lat] : [(s.left + s.right) / 2, (s.top + s.bottom) / 2]; }
    function K(t) { return t * (Math.PI / 180); }
    function J(t) { return t / Math.PI * 180; }
    function V(t) { var s, i, a, h, e, n, r, o = t.lat, l = t.lon, u = 6378137, c = K(o), M = K(l); r = Math.floor((l + 180) / 6) + 1, 180 === l && (r = 60), o >= 56 && o < 64 && l >= 3 && l < 12 && (r = 32), o >= 72 && o < 84 && (l >= 0 && l < 9 ? r = 31 : l >= 9 && l < 21 ? r = 33 : l >= 21 && l < 33 ? r = 35 : l >= 33 && l < 42 && (r = 37)), n = K(6 * (r - 1) - 180 + 3), s = u / Math.sqrt(1 - .00669438 * Math.sin(c) * Math.sin(c)), i = Math.tan(c) * Math.tan(c), a = .006739496752268451 * Math.cos(c) * Math.cos(c); var f = .9996 * s * ((h = Math.cos(c) * (M - n)) + (1 - i + a) * h * h * h / 6 + (5 - 18 * i + i * i + 72 * a - .39089081163157013) * h * h * h * h * h / 120) + 5e5, d = .9996 * ((e = u * (.9983242984503243 * c - .002514607064228144 * Math.sin(2 * c) + 2639046602129982e-21 * Math.sin(4 * c) - 3.418046101696858e-9 * Math.sin(6 * c))) + s * Math.tan(c) * (h * h / 2 + (5 - i + 9 * a + 4 * a * a) * h * h * h * h / 24 + (61 - 58 * i + i * i + 600 * a - 2.2240339282485886) * h * h * h * h * h * h / 720)); return o < 0 && (d += 1e7), { northing: Math.round(d), easting: Math.round(f), zoneNumber: r, zoneLetter: Y(o) }; }
    function Z(t) { var s = t.northing, i = t.easting, a = t.zoneLetter, h = t.zoneNumber; if (h < 0 || h > 60)
        return null; var e, n, r, o, l, u, c, M, f = 6378137, d = (1 - Math.sqrt(.99330562)) / (1 + Math.sqrt(.99330562)), m = i - 5e5, p = s; a < "N" && (p -= 1e7), u = 6 * (h - 1) - 180 + 3, M = (c = p / .9996 / 6367449.145945056) + (3 * d / 2 - 27 * d * d * d / 32) * Math.sin(2 * c) + (21 * d * d / 16 - 55 * d * d * d * d / 32) * Math.sin(4 * c) + 151 * d * d * d / 96 * Math.sin(6 * c), e = f / Math.sqrt(1 - .00669438 * Math.sin(M) * Math.sin(M)), n = Math.tan(M) * Math.tan(M), r = .006739496752268451 * Math.cos(M) * Math.cos(M), o = .99330562 * f / Math.pow(1 - .00669438 * Math.sin(M) * Math.sin(M), 1.5), l = m / (.9996 * e); var y = M - e * Math.tan(M) / o * (l * l / 2 - (5 + 3 * n + 10 * r - 4 * r * r - .06065547077041606) * l * l * l * l / 24 + (61 + 90 * n + 298 * r + 45 * n * n - 1.6983531815716497 - 3 * r * r) * l * l * l * l * l * l / 720); y = J(y); var _ = (l - (1 + 2 * n + r) * l * l * l / 6 + (5 - 2 * r + 28 * n - 3 * r * r + .05391597401814761 + 24 * n * n) * l * l * l * l * l / 120) / Math.cos(M); _ = u + J(_); var x; if (t.accuracy) {
        var g = Z({ northing: t.northing + t.accuracy, easting: t.easting + t.accuracy, zoneLetter: t.zoneLetter, zoneNumber: t.zoneNumber });
        x = { top: g.lat, right: g.lon, bottom: y, left: _ };
    }
    else
        x = { lat: y, lon: _ }; return x; }
    function Y(t) { var s = "Z"; return 84 >= t && t >= 72 ? s = "X" : 72 > t && t >= 64 ? s = "W" : 64 > t && t >= 56 ? s = "V" : 56 > t && t >= 48 ? s = "U" : 48 > t && t >= 40 ? s = "T" : 40 > t && t >= 32 ? s = "S" : 32 > t && t >= 24 ? s = "R" : 24 > t && t >= 16 ? s = "Q" : 16 > t && t >= 8 ? s = "P" : 8 > t && t >= 0 ? s = "N" : 0 > t && t >= -8 ? s = "M" : -8 > t && t >= -16 ? s = "L" : -16 > t && t >= -24 ? s = "K" : -24 > t && t >= -32 ? s = "J" : -32 > t && t >= -40 ? s = "H" : -40 > t && t >= -48 ? s = "G" : -48 > t && t >= -56 ? s = "F" : -56 > t && t >= -64 ? s = "E" : -64 > t && t >= -72 ? s = "D" : -72 > t && t >= -80 && (s = "C"), s; }
    function $(t, s) { var i = "00000" + t.easting, a = "00000" + t.northing; return t.zoneNumber + t.zoneLetter + tt(t.easting, t.northing, t.zoneNumber) + i.substr(i.length - 5, s) + a.substr(a.length - 5, s); }
    function tt(t, s, i) { var a = st(i); return it(Math.floor(t / 1e5), Math.floor(s / 1e5) % 20, a); }
    function st(t) { var s = t % ds; return 0 === s && (s = ds), s; }
    function it(t, s, i) { var a = i - 1, h = ms.charCodeAt(a), e = ps.charCodeAt(a), n = h + t - 1, r = e + s, o = !1; return n > vs && (n = n - vs + ys - 1, o = !0), (n === _s || h < _s && n > _s || (n > _s || h < _s) && o) && n++, (n === xs || h < xs && n > xs || (n > xs || h < xs) && o) && ++n === _s && n++, n > vs && (n = n - vs + ys - 1), r > gs ? (r = r - gs + ys - 1, o = !0) : o = !1, (r === _s || e < _s && r > _s || (r > _s || e < _s) && o) && r++, (r === xs || e < xs && r > xs || (r > xs || e < xs) && o) && ++r === _s && r++, r > gs && (r = r - gs + ys - 1), String.fromCharCode(n) + String.fromCharCode(r); }
    function at(t) { if (t && 0 === t.length)
        throw "MGRSPoint coverting from nothing"; for (var s, i = t.length, a = null, h = "", e = 0; !/[A-Z]/.test(s = t.charAt(e));) {
        if (e >= 2)
            throw "MGRSPoint bad conversion from: " + t;
        h += s, e++;
    } var n = parseInt(h, 10); if (0 === e || e + 3 > i)
        throw "MGRSPoint bad conversion from: " + t; var r = t.charAt(e++); if (r <= "A" || "B" === r || "Y" === r || r >= "Z" || "I" === r || "O" === r)
        throw "MGRSPoint zone letter " + r + " not handled: " + t; a = t.substring(e, e += 2); for (var o = st(n), l = ht(a.charAt(0), o), u = et(a.charAt(1), o); u < nt(r);)
        u += 2e6; var c = i - e; if (c % 2 != 0)
        throw "MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters" + t; var M, f, d, m, p, y = c / 2, _ = 0, x = 0; return y > 0 && (M = 1e5 / Math.pow(10, y), f = t.substring(e, e + y), _ = parseFloat(f) * M, d = t.substring(e + y), x = parseFloat(d) * M), m = _ + l, p = x + u, { easting: m, northing: p, zoneLetter: r, zoneNumber: n, accuracy: M }; }
    function ht(t, s) { for (var i = ms.charCodeAt(s - 1), a = 1e5, h = !1; i !== t.charCodeAt(0);) {
        if (++i === _s && i++, i === xs && i++, i > vs) {
            if (h)
                throw "Bad character: " + t;
            i = ys, h = !0;
        }
        a += 1e5;
    } return a; }
    function et(t, s) { if (t > "V")
        throw "MGRSPoint given invalid Northing " + t; for (var i = ps.charCodeAt(s - 1), a = 0, h = !1; i !== t.charCodeAt(0);) {
        if (++i === _s && i++, i === xs && i++, i > gs) {
            if (h)
                throw "Bad character: " + t;
            i = ys, h = !0;
        }
        a += 1e5;
    } return a; }
    function nt(t) { var s; switch (t) {
        case "C":
            s = 11e5;
            break;
        case "D":
            s = 2e6;
            break;
        case "E":
            s = 28e5;
            break;
        case "F":
            s = 37e5;
            break;
        case "G":
            s = 46e5;
            break;
        case "H":
            s = 55e5;
            break;
        case "J":
            s = 64e5;
            break;
        case "K":
            s = 73e5;
            break;
        case "L":
            s = 82e5;
            break;
        case "M":
            s = 91e5;
            break;
        case "N":
            s = 0;
            break;
        case "P":
            s = 8e5;
            break;
        case "Q":
            s = 17e5;
            break;
        case "R":
            s = 26e5;
            break;
        case "S":
            s = 35e5;
            break;
        case "T":
            s = 44e5;
            break;
        case "U":
            s = 53e5;
            break;
        case "V":
            s = 62e5;
            break;
        case "W":
            s = 7e6;
            break;
        case "X":
            s = 79e5;
            break;
        default: s = -1;
    } if (s >= 0)
        return s; throw "Invalid zone letter: " + t; }
    function Point(t, s, i) { if (!(this instanceof Point))
        return new Point(t, s, i); if (Array.isArray(t))
        this.x = t[0], this.y = t[1], this.z = t[2] || 0;
    else if ("object" == typeof t)
        this.x = t.x, this.y = t.y, this.z = t.z || 0;
    else if ("string" == typeof t && void 0 === s) {
        var a = t.split(",");
        this.x = parseFloat(a[0], 10), this.y = parseFloat(a[1], 10), this.z = parseFloat(a[2], 10) || 0;
    }
    else
        this.x = t, this.y = s, this.z = i || 0; console.warn("proj4.Point will be removed in version 3, use proj4.toPoint"); }
    function rt(t) { var s = ["Hotine_Oblique_Mercator", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin"], i = "object" == typeof t.PROJECTION ? Object.keys(t.PROJECTION)[0] : t.PROJECTION; return "no_uoff" in t || "no_off" in t || -1 !== s.indexOf(i); }
    function ot(t) { var s, i = []; return i[0] = t * ei, s = t * t, i[0] += s * ni, i[1] = s * oi, s *= t, i[0] += s * ri, i[1] += s * li, i[2] = s * ui, i; }
    function lt(t, s) { var i = t + t; return t + s[0] * Math.sin(i) + s[1] * Math.sin(i + i) + s[2] * Math.sin(i + i + i); }
    function ut(t, s, i, a) { var h; return t < Ct ? (a.value = Ii.AREA_0, h = 0) : (h = Math.atan2(s, i), Math.abs(h) <= It ? a.value = Ii.AREA_0 : h > It && h <= wt + It ? (a.value = Ii.AREA_1, h -= wt) : h > wt + It || h <= -(wt + It) ? (a.value = Ii.AREA_2, h = h >= 0 ? h - kt : h + kt) : (a.value = Ii.AREA_3, h += wt)), h; }
    function ct(t, s) { var i = t + s; return i < -kt ? i += Ot : i > +kt && (i -= Ot), i; }
    function Mt(t, s, i, a) { for (var h = s; a; --a) {
        var e = t(h);
        if (h -= e, Math.abs(e) < i)
            break;
    } return h; }
    function ft(t) { var s, i, a, h = Vt(t.x - (this.long0 || 0)), e = t.y; return s = this.am1 + this.m1 - Es(e, i = Math.sin(e), a = Math.cos(e), this.en), i = a * h / (s * Math.sqrt(1 - this.es * i * i)), t.x = s * Math.sin(i), t.y = this.am1 - s * Math.cos(i), t.x = this.a * t.x + (this.x0 || 0), t.y = this.a * t.y + (this.y0 || 0), t; }
    function dt(t) { t.x = (t.x - (this.x0 || 0)) / this.a, t.y = (t.y - (this.y0 || 0)) / this.a; var s, i, a, h; if (i = Ss(t.x, t.y = this.am1 - t.y), h = As(this.am1 + this.m1 - i, this.es, this.en), (s = Math.abs(h)) < wt)
        s = Math.sin(h), a = i * Math.atan2(t.x, t.y) * Math.sqrt(1 - this.es * s * s) / Math.cos(h);
    else {
        if (!(Math.abs(s - wt) <= $i))
            throw new Error;
        a = 0;
    } return t.x = Vt(a + (this.long0 || 0)), t.y = si(h), t; }
    function mt(t) { var s, i, a = Vt(t.x - (this.long0 || 0)), h = t.y; return i = this.cphi1 + this.phi1 - h, Math.abs(i) > $i ? (t.x = i * Math.sin(s = a * Math.cos(h) / i), t.y = this.cphi1 - i * Math.cos(s)) : t.x = t.y = 0, t.x = this.a * t.x + (this.x0 || 0), t.y = this.a * t.y + (this.y0 || 0), t; }
    function pt(t) { t.x = (t.x - (this.x0 || 0)) / this.a, t.y = (t.y - (this.y0 || 0)) / this.a; var s, i, a = Ss(t.x, t.y = this.cphi1 - t.y); if (i = this.cphi1 + this.phi1 - a, Math.abs(i) > wt)
        throw new Error; return s = Math.abs(Math.abs(i) - wt) <= $i ? 0 : a * Math.atan2(t.x, t.y) / Math.cos(i), t.x = Vt(s + (this.long0 || 0)), t.y = si(i), t; }
    var yt = 1, _t = 2, xt = 3, gt = 4, vt = 5, bt = 484813681109536e-20, wt = Math.PI / 2, Nt = .16666666666666666, Et = .04722222222222222, At = .022156084656084655, Ct = 1e-10, Pt = .017453292519943295, St = 57.29577951308232, It = Math.PI / 4, Ot = 2 * Math.PI, kt = 3.14159265359, qt = {};
    qt.greenwich = 0, qt.lisbon = -9.131906111111, qt.paris = 2.337229166667, qt.bogota = -74.080916666667, qt.madrid = -3.687938888889, qt.rome = 12.452333333333, qt.bern = 7.439583333333, qt.jakarta = 106.807719444444, qt.ferro = -17.666666666667, qt.brussels = 4.367975, qt.stockholm = 18.058277777778, qt.athens = 23.7163375, qt.oslo = 10.722916666667;
    var Rt = { mm: { to_meter: .001 }, cm: { to_meter: .01 }, ft: { to_meter: .3048 }, "us-ft": { to_meter: 1200 / 3937 }, fath: { to_meter: 1.8288 }, kmi: { to_meter: 1852 }, "us-ch": { to_meter: 20.1168402336805 }, "us-mi": { to_meter: 1609.34721869444 }, km: { to_meter: 1e3 }, "ind-ft": { to_meter: .30479841 }, "ind-yd": { to_meter: .91439523 }, mi: { to_meter: 1609.344 }, yd: { to_meter: .9144 }, ch: { to_meter: 20.1168 }, link: { to_meter: .201168 }, dm: { to_meter: .01 }, in: { to_meter: .0254 }, "ind-ch": { to_meter: 20.11669506 }, "us-in": { to_meter: .025400050800101 }, "us-yd": { to_meter: .914401828803658 } }, Lt = /[\s_\-\/\(\)]/g, Gt = function (s) { var i, a, h, e = {}, n = s.split("+").map(function (t) { return t.trim(); }).filter(function (t) { return t; }).reduce(function (t, s) { var i = s.split("="); return i.push(!0), t[i[0].toLowerCase()] = i[1], t; }, {}), r = { proj: "projName", datum: "datumCode", rf: function (t) { e.rf = parseFloat(t); }, lat_0: function (t) { e.lat0 = t * Pt; }, lat_1: function (t) { e.lat1 = t * Pt; }, lat_2: function (t) { e.lat2 = t * Pt; }, lat_ts: function (t) { e.lat_ts = t * Pt; }, lon_0: function (t) { e.long0 = t * Pt; }, lon_1: function (t) { e.long1 = t * Pt; }, lon_2: function (t) { e.long2 = t * Pt; }, alpha: function (t) { e.alpha = parseFloat(t) * Pt; }, gamma: function (t) { e.rectified_grid_angle = parseFloat(t); }, lonc: function (t) { e.longc = t * Pt; }, x_0: function (t) { e.x0 = parseFloat(t); }, y_0: function (t) { e.y0 = parseFloat(t); }, k_0: function (t) { e.k0 = parseFloat(t); }, k: function (t) { e.k0 = parseFloat(t); }, a: function (t) { e.a = parseFloat(t); }, b: function (t) { e.b = parseFloat(t); }, r: function (t) { e.a = e.b = parseFloat(t); }, r_a: function () { e.R_A = !0; }, zone: function (t) { e.zone = parseInt(t, 10); }, south: function () { e.utmSouth = !0; }, towgs84: function (t) { e.datum_params = t.split(",").map(function (t) { return parseFloat(t); }); }, to_meter: function (t) { e.to_meter = parseFloat(t); }, units: function (s) { e.units = s; var i = t(Rt, s); i && (e.to_meter = i.to_meter); }, from_greenwich: function (t) { e.from_greenwich = t * Pt; }, pm: function (s) { var i = t(qt, s); e.from_greenwich = (i || parseFloat(s)) * Pt; }, nadgrids: function (t) { "@null" === t ? e.datumCode = "none" : e.nadgrids = t; }, axis: function (t) { 3 === t.length && -1 !== "ewnsud".indexOf(t.substr(0, 1)) && -1 !== "ewnsud".indexOf(t.substr(1, 1)) && -1 !== "ewnsud".indexOf(t.substr(2, 1)) && (e.axis = t); }, approx: function () { e.approx = !0; } }; for (i in n)
        a = n[i], i in r ? "function" == typeof (h = r[i]) ? h(a) : e[h] = a : e[i] = a; return "string" == typeof e.datumCode && "WGS84" !== e.datumCode && (e.datumCode = e.datumCode.toLowerCase()), e; }, jt = 1, Tt = /\s/, Bt = /[A-Za-z]/, zt = /[A-Za-z84_]/, Ft = /[,\]]/, Dt = /[\d\.E\-\+]/;
    s.prototype.readCharicter = function () { var t = this.text[this.place++]; if (4 !== this.state)
        for (; Tt.test(t);) {
            if (this.place >= this.text.length)
                return;
            t = this.text[this.place++];
        } switch (this.state) {
        case jt: return this.neutral(t);
        case 2: return this.keyword(t);
        case 4: return this.quoted(t);
        case 5: return this.afterquote(t);
        case 3: return this.number(t);
        case -1: return;
    } }, s.prototype.afterquote = function (t) { if ('"' === t)
        return this.word += '"', void (this.state = 4); if (Ft.test(t))
        return this.word = this.word.trim(), void this.afterItem(t); throw new Error("havn't handled \"" + t + '" in afterquote yet, index ' + this.place); }, s.prototype.afterItem = function (t) { return "," === t ? (null !== this.word && this.currentObject.push(this.word), this.word = null, void (this.state = jt)) : "]" === t ? (this.level--, null !== this.word && (this.currentObject.push(this.word), this.word = null), this.state = jt, this.currentObject = this.stack.pop(), void (this.currentObject || (this.state = -1))) : void 0; }, s.prototype.number = function (t) { if (!Dt.test(t)) {
        if (Ft.test(t))
            return this.word = parseFloat(this.word), void this.afterItem(t);
        throw new Error("havn't handled \"" + t + '" in number yet, index ' + this.place);
    } this.word += t; }, s.prototype.quoted = function (t) { '"' !== t ? this.word += t : this.state = 5; }, s.prototype.keyword = function (t) { if (zt.test(t))
        this.word += t;
    else {
        if ("[" === t) {
            var s = [];
            return s.push(this.word), this.level++, null === this.root ? this.root = s : this.currentObject.push(s), this.stack.push(this.currentObject), this.currentObject = s, void (this.state = jt);
        }
        if (!Ft.test(t))
            throw new Error("havn't handled \"" + t + '" in keyword yet, index ' + this.place);
        this.afterItem(t);
    } }, s.prototype.neutral = function (t) { if (Bt.test(t))
        return this.word = t, void (this.state = 2); if ('"' === t)
        return this.word = "", void (this.state = 4); if (Dt.test(t))
        return this.word = t, void (this.state = 3); {
        if (!Ft.test(t))
            throw new Error("havn't handled \"" + t + '" in neutral yet, index ' + this.place);
        this.afterItem(t);
    } }, s.prototype.output = function () { for (; this.place < this.text.length;)
        this.readCharicter(); if (-1 === this.state)
        return this.root; throw new Error('unable to parse string "' + this.text + '". State is ' + this.state); };
    var Ut = .017453292519943295, Qt = function (t) { var s = i(t), a = s.shift(), e = s.shift(); s.unshift(["name", e]), s.unshift(["type", a]); var n = {}; return h(s, n), r(n), n; };
    !function (t) { t("EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees"), t("EPSG:4269", "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees"), t("EPSG:3857", "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"); for (var s = 0; s <= 60; ++s)
        t("EPSG:" + (32600 + s), "+proj=utm +zone=" + s + " +datum=WGS84 +units=m"), t("EPSG:" + (32700 + s), "+proj=utm +zone=" + s + " +south +datum=WGS84 +units=m"); t.WGS84 = t["EPSG:4326"], t["EPSG:3785"] = t["EPSG:3857"], t.GOOGLE = t["EPSG:3857"], t["EPSG:900913"] = t["EPSG:3857"], t["EPSG:102113"] = t["EPSG:3857"]; }(o);
    var Wt = ["PROJECTEDCRS", "PROJCRS", "GEOGCS", "GEOCCS", "PROJCS", "LOCAL_CS", "GEODCRS", "GEODETICCRS", "GEODETICDATUM", "ENGCRS", "ENGINEERINGCRS"], Ht = ["3857", "900913", "3785", "102113"], Xt = function (t, s) { t = t || {}; var i, a; if (!s)
        return t; for (a in s)
        void 0 !== (i = s[a]) && (t[a] = i); return t; }, Kt = function (t, s, i) { var a = t * s; return i / Math.sqrt(1 - a * a); }, Jt = function (t) { return t < 0 ? -1 : 1; }, Vt = function (t) { return Math.abs(t) <= kt ? t : t - Jt(t) * Ot; }, Zt = function (t, s, i) { var a = t * i, h = .5 * t; return a = Math.pow((1 - a) / (1 + a), h), Math.tan(.5 * (wt - s)) / a; }, Yt = function (t, s) { for (var i, a, h = .5 * t, e = wt - 2 * Math.atan(s), n = 0; n <= 15; n++)
        if (i = t * Math.sin(e), a = wt - 2 * Math.atan(s * Math.pow((1 - i) / (1 + i), h)) - e, e += a, Math.abs(a) <= 1e-10)
            return e; return -9999; }, $t = [{ init: function () { var t = this.b / this.a; this.es = 1 - t * t, "x0" in this || (this.x0 = 0), "y0" in this || (this.y0 = 0), this.e = Math.sqrt(this.es), this.lat_ts ? this.sphere ? this.k0 = Math.cos(this.lat_ts) : this.k0 = Kt(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) : this.k0 || (this.k ? this.k0 = this.k : this.k0 = 1); }, forward: function (t) { var s = t.x, i = t.y; if (i * St > 90 && i * St < -90 && s * St > 180 && s * St < -180)
                return null; var a, h; if (Math.abs(Math.abs(i) - wt) <= Ct)
                return null; if (this.sphere)
                a = this.x0 + this.a * this.k0 * Vt(s - this.long0), h = this.y0 + this.a * this.k0 * Math.log(Math.tan(It + .5 * i));
            else {
                var e = Math.sin(i), n = Zt(this.e, i, e);
                a = this.x0 + this.a * this.k0 * Vt(s - this.long0), h = this.y0 - this.a * this.k0 * Math.log(n);
            } return t.x = a, t.y = h, t; }, inverse: function (t) { var s, i, a = t.x - this.x0, h = t.y - this.y0; if (this.sphere)
                i = wt - 2 * Math.atan(Math.exp(-h / (this.a * this.k0)));
            else {
                var e = Math.exp(-h / (this.a * this.k0));
                if (-9999 === (i = Yt(this.e, e)))
                    return null;
            } return s = Vt(this.long0 + a / (this.a * this.k0)), t.x = s, t.y = i, t; }, names: ["Mercator", "Popular Visualisation Pseudo Mercator", "Mercator_1SP", "Mercator_Auxiliary_Sphere", "merc"] }, { init: function () { }, forward: p, inverse: p, names: ["longlat", "identity"] }], ts = {}, ss = [], is = { start: function () { $t.forEach(y); }, add: y, get: function (t) { if (!t)
            return !1; var s = t.toLowerCase(); return void 0 !== ts[s] && ss[ts[s]] ? ss[ts[s]] : void 0; } }, as = {};
    as.MERIT = { a: 6378137, rf: 298.257, ellipseName: "MERIT 1983" }, as.SGS85 = { a: 6378136, rf: 298.257, ellipseName: "Soviet Geodetic System 85" }, as.GRS80 = { a: 6378137, rf: 298.257222101, ellipseName: "GRS 1980(IUGG, 1980)" }, as.IAU76 = { a: 6378140, rf: 298.257, ellipseName: "IAU 1976" }, as.airy = { a: 6377563.396, b: 6356256.91, ellipseName: "Airy 1830" }, as.APL4 = { a: 6378137, rf: 298.25, ellipseName: "Appl. Physics. 1965" }, as.NWL9D = { a: 6378145, rf: 298.25, ellipseName: "Naval Weapons Lab., 1965" }, as.mod_airy = { a: 6377340.189, b: 6356034.446, ellipseName: "Modified Airy" }, as.andrae = { a: 6377104.43, rf: 300, ellipseName: "Andrae 1876 (Den., Iclnd.)" }, as.aust_SA = { a: 6378160, rf: 298.25, ellipseName: "Australian Natl & S. Amer. 1969" }, as.GRS67 = { a: 6378160, rf: 298.247167427, ellipseName: "GRS 67(IUGG 1967)" }, as.bessel = { a: 6377397.155, rf: 299.1528128, ellipseName: "Bessel 1841" }, as.bess_nam = { a: 6377483.865, rf: 299.1528128, ellipseName: "Bessel 1841 (Namibia)" }, as.clrk66 = { a: 6378206.4, b: 6356583.8, ellipseName: "Clarke 1866" }, as.clrk80 = { a: 6378249.145, rf: 293.4663, ellipseName: "Clarke 1880 mod." }, as.clrk80ign = { a: 6378249.2, b: 6356515, rf: 293.4660213, ellipseName: "Clarke 1880 (IGN)" }, as.clrk58 = { a: 6378293.645208759, rf: 294.2606763692654, ellipseName: "Clarke 1858" }, as.CPM = { a: 6375738.7, rf: 334.29, ellipseName: "Comm. des Poids et Mesures 1799" }, as.delmbr = { a: 6376428, rf: 311.5, ellipseName: "Delambre 1810 (Belgium)" }, as.engelis = { a: 6378136.05, rf: 298.2566, ellipseName: "Engelis 1985" }, as.evrst30 = { a: 6377276.345, rf: 300.8017, ellipseName: "Everest 1830" }, as.evrst48 = { a: 6377304.063, rf: 300.8017, ellipseName: "Everest 1948" }, as.evrst56 = { a: 6377301.243, rf: 300.8017, ellipseName: "Everest 1956" }, as.evrst69 = { a: 6377295.664, rf: 300.8017, ellipseName: "Everest 1969" }, as.evrstSS = { a: 6377298.556, rf: 300.8017, ellipseName: "Everest (Sabah & Sarawak)" }, as.fschr60 = { a: 6378166, rf: 298.3, ellipseName: "Fischer (Mercury Datum) 1960" }, as.fschr60m = { a: 6378155, rf: 298.3, ellipseName: "Fischer 1960" }, as.fschr68 = { a: 6378150, rf: 298.3, ellipseName: "Fischer 1968" }, as.helmert = { a: 6378200, rf: 298.3, ellipseName: "Helmert 1906" }, as.hough = { a: 6378270, rf: 297, ellipseName: "Hough" }, as.intl = { a: 6378388, rf: 297, ellipseName: "International 1909 (Hayford)" }, as.kaula = { a: 6378163, rf: 298.24, ellipseName: "Kaula 1961" }, as.lerch = { a: 6378139, rf: 298.257, ellipseName: "Lerch 1979" }, as.mprts = { a: 6397300, rf: 191, ellipseName: "Maupertius 1738" }, as.new_intl = { a: 6378157.5, b: 6356772.2, ellipseName: "New International 1967" }, as.plessis = { a: 6376523, rf: 6355863, ellipseName: "Plessis 1817 (France)" }, as.krass = { a: 6378245, rf: 298.3, ellipseName: "Krassovsky, 1942" }, as.SEasia = { a: 6378155, b: 6356773.3205, ellipseName: "Southeast Asia" }, as.walbeck = { a: 6376896, b: 6355834.8467, ellipseName: "Walbeck" }, as.WGS60 = { a: 6378165, rf: 298.3, ellipseName: "WGS 60" }, as.WGS66 = { a: 6378145, rf: 298.25, ellipseName: "WGS 66" }, as.WGS7 = { a: 6378135, rf: 298.26, ellipseName: "WGS 72" };
    var hs = as.WGS84 = { a: 6378137, rf: 298.257223563, ellipseName: "WGS 84" };
    as.sphere = { a: 6370997, b: 6370997, ellipseName: "Normal Sphere (r=6370997)" };
    var es = { wgs84: { towgs84: "0,0,0", ellipse: "WGS84", datumName: "WGS84" }, ch1903: { towgs84: "674.374,15.056,405.346", ellipse: "bessel", datumName: "swiss" }, ggrs87: { towgs84: "-199.87,74.79,246.62", ellipse: "GRS80", datumName: "Greek_Geodetic_Reference_System_1987" }, nad83: { towgs84: "0,0,0", ellipse: "GRS80", datumName: "North_American_Datum_1983" }, nad27: { nadgrids: "@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat", ellipse: "clrk66", datumName: "North_American_Datum_1927" }, potsdam: { towgs84: "598.1,73.7,418.2,0.202,0.045,-2.455,6.7", ellipse: "bessel", datumName: "Potsdam Rauenberg 1950 DHDN" }, carthage: { towgs84: "-263.0,6.0,431.0", ellipse: "clark80", datumName: "Carthage 1934 Tunisia" }, hermannskogel: { towgs84: "577.326,90.129,463.919,5.137,1.474,5.297,2.4232", ellipse: "bessel", datumName: "Hermannskogel" }, militargeographische_institut: { towgs84: "577.326,90.129,463.919,5.137,1.474,5.297,2.4232", ellipse: "bessel", datumName: "Militar-Geographische Institut" }, osni52: { towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15", ellipse: "airy", datumName: "Irish National" }, ire65: { towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15", ellipse: "mod_airy", datumName: "Ireland 1965" }, rassadiran: { towgs84: "-133.63,-157.5,-158.62", ellipse: "intl", datumName: "Rassadiran" }, nzgd49: { towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993", ellipse: "intl", datumName: "New Zealand Geodetic Datum 1949" }, osgb36: { towgs84: "446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894", ellipse: "airy", datumName: "Ordnance Survey of Great Britain 1936" }, s_jtsk: { towgs84: "589,76,480", ellipse: "bessel", datumName: "S-JTSK (Ferro)" }, beduaram: { towgs84: "-106,-87,188", ellipse: "clrk80", datumName: "Beduaram" }, gunung_segara: { towgs84: "-403,684,41", ellipse: "bessel", datumName: "Gunung Segara Jakarta" }, rnb72: { towgs84: "106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1", ellipse: "intl", datumName: "Reseau National Belge 1972" } };
    for (var ns in es) {
        var rs = es[ns];
        es[rs.datumName] = rs;
    }
    var os = {};
    Projection.projections = is, Projection.projections.start();
    var ls = function (t, s, i) { if (O(t, s))
        return i; if (t.datum_type === vt || s.datum_type === vt)
        return i; var a = t.a, h = t.es; if (t.datum_type === xt) {
        if (0 !== j(t, !1, i))
            return;
        a = 6378137, h = .0066943799901413165;
    } var e = s.a, n = s.b, r = s.es; return s.datum_type === xt && (e = 6378137, n = 6356752.314, r = .0066943799901413165), h !== r || a !== e || G(t.datum_type) || G(s.datum_type) ? (i = k(i, h, a), G(t.datum_type) && (i = R(i, t.datum_type, t.datum_params)), G(s.datum_type) && (i = L(i, s.datum_type, s.datum_params)), i = q(i, r, e, n), s.datum_type !== xt || 0 === j(s, !0, i) ? i : void 0) : i; }, us = function (t, s, i) { var a, h, e, n = i.x, r = i.y, o = i.z || 0, l = {}; for (e = 0; e < 3; e++)
        if (!s || 2 !== e || void 0 !== i.z)
            switch (0 === e ? (a = n, h = -1 !== "ew".indexOf(t.axis[e]) ? "x" : "y") : 1 === e ? (a = r, h = -1 !== "ns".indexOf(t.axis[e]) ? "y" : "x") : (a = o, h = "z"), t.axis[e]) {
                case "e":
                    l[h] = a;
                    break;
                case "w":
                    l[h] = -a;
                    break;
                case "n":
                    l[h] = a;
                    break;
                case "s":
                    l[h] = -a;
                    break;
                case "u":
                    void 0 !== i[h] && (l.z = a);
                    break;
                case "d":
                    void 0 !== i[h] && (l.z = -a);
                    break;
                default: return null;
            } return l; }, cs = function (t) { var s = { x: t[0], y: t[1] }; return t.length > 2 && (s.z = t[2]), t.length > 3 && (s.m = t[3]), s; }, Ms = function (t) { z(t.x), z(t.y); }, fs = Projection("WGS84"), ds = 6, ms = "AJSAJS", ps = "AFAFAF", ys = 65, _s = 73, xs = 79, gs = 86, vs = 90, bs = { forward: H, inverse: function (t) { var s = Z(at(t.toUpperCase())); return s.lat && s.lon ? [s.lon, s.lat, s.lon, s.lat] : [s.left, s.bottom, s.right, s.top]; }, toPoint: X };
    Point.fromMGRS = function (t) { return new Point(X(t)); }, Point.prototype.toMGRS = function (t) { return H([this.x, this.y], t); };
    var ws = .01068115234375, Ns = function (t) { var s = []; s[0] = 1 - t * (.25 + t * (.046875 + t * (.01953125 + t * ws))), s[1] = t * (.75 - t * (.046875 + t * (.01953125 + t * ws))); var i = t * t; return s[2] = i * (.46875 - t * (.013020833333333334 + .007120768229166667 * t)), i *= t, s[3] = i * (.3645833333333333 - .005696614583333333 * t), s[4] = i * t * .3076171875, s; }, Es = function (t, s, i, a) { return i *= s, s *= s, a[0] * t - i * (a[1] + s * (a[2] + s * (a[3] + s * a[4]))); }, As = function (t, s, i) { for (var a = 1 / (1 - s), h = t, e = 20; e; --e) {
        var n = Math.sin(h), r = 1 - s * n * n;
        if (r = (Es(h, n, Math.cos(h), i) - t) * (r * Math.sqrt(r)) * a, h -= r, Math.abs(r) < Ct)
            return h;
    } return h; }, Cs = { init: function () { this.x0 = void 0 !== this.x0 ? this.x0 : 0, this.y0 = void 0 !== this.y0 ? this.y0 : 0, this.long0 = void 0 !== this.long0 ? this.long0 : 0, this.lat0 = void 0 !== this.lat0 ? this.lat0 : 0, this.es && (this.en = Ns(this.es), this.ml0 = Es(this.lat0, Math.sin(this.lat0), Math.cos(this.lat0), this.en)); }, forward: function (t) { var s, i, a, h = t.x, e = t.y, n = Vt(h - this.long0), r = Math.sin(e), o = Math.cos(e); if (this.es) {
            var l = o * n, u = Math.pow(l, 2), c = this.ep2 * Math.pow(o, 2), M = Math.pow(c, 2), f = Math.abs(o) > Ct ? Math.tan(e) : 0, d = Math.pow(f, 2), m = Math.pow(d, 2);
            s = 1 - this.es * Math.pow(r, 2), l /= Math.sqrt(s);
            var p = Es(e, r, o, this.en);
            i = this.a * (this.k0 * l * (1 + u / 6 * (1 - d + c + u / 20 * (5 - 18 * d + m + 14 * c - 58 * d * c + u / 42 * (61 + 179 * m - m * d - 479 * d))))) + this.x0, a = this.a * (this.k0 * (p - this.ml0 + r * n * l / 2 * (1 + u / 12 * (5 - d + 9 * c + 4 * M + u / 30 * (61 + m - 58 * d + 270 * c - 330 * d * c + u / 56 * (1385 + 543 * m - m * d - 3111 * d)))))) + this.y0;
        }
        else {
            var y = o * Math.sin(n);
            if (Math.abs(Math.abs(y) - 1) < Ct)
                return 93;
            if (i = .5 * this.a * this.k0 * Math.log((1 + y) / (1 - y)) + this.x0, a = o * Math.cos(n) / Math.sqrt(1 - Math.pow(y, 2)), (y = Math.abs(a)) >= 1) {
                if (y - 1 > Ct)
                    return 93;
                a = 0;
            }
            else
                a = Math.acos(a);
            e < 0 && (a = -a), a = this.a * this.k0 * (a - this.lat0) + this.y0;
        } return t.x = i, t.y = a, t; }, inverse: function (t) { var s, i, a, h, e = (t.x - this.x0) * (1 / this.a), n = (t.y - this.y0) * (1 / this.a); if (this.es)
            if (s = this.ml0 + n / this.k0, i = As(s, this.es, this.en), Math.abs(i) < wt) {
                var r = Math.sin(i), o = Math.cos(i), l = Math.abs(o) > Ct ? Math.tan(i) : 0, u = this.ep2 * Math.pow(o, 2), c = Math.pow(u, 2), M = Math.pow(l, 2), f = Math.pow(M, 2);
                s = 1 - this.es * Math.pow(r, 2);
                var d = e * Math.sqrt(s) / this.k0, m = Math.pow(d, 2);
                a = i - (s *= l) * m / (1 - this.es) * .5 * (1 - m / 12 * (5 + 3 * M - 9 * u * M + u - 4 * c - m / 30 * (61 + 90 * M - 252 * u * M + 45 * f + 46 * u - m / 56 * (1385 + 3633 * M + 4095 * f + 1574 * f * M)))), h = Vt(this.long0 + d * (1 - m / 6 * (1 + 2 * M + u - m / 20 * (5 + 28 * M + 24 * f + 8 * u * M + 6 * u - m / 42 * (61 + 662 * M + 1320 * f + 720 * f * M)))) / o);
            }
            else
                a = wt * Jt(n), h = 0;
        else {
            var p = Math.exp(e / this.k0), y = .5 * (p - 1 / p), _ = this.lat0 + n / this.k0, x = Math.cos(_);
            s = Math.sqrt((1 - Math.pow(x, 2)) / (1 + Math.pow(y, 2))), a = Math.asin(s), n < 0 && (a = -a), h = 0 === y && 0 === x ? 0 : Vt(Math.atan2(y, x) + this.long0);
        } return t.x = h, t.y = a, t; }, names: ["Fast_Transverse_Mercator", "Fast Transverse Mercator"] }, Ps = function (t) { var s = Math.exp(t); return s = (s - 1 / s) / 2; }, Ss = function (t, s) { t = Math.abs(t), s = Math.abs(s); var i = Math.max(t, s), a = Math.min(t, s) / (i || 1); return i * Math.sqrt(1 + Math.pow(a, 2)); }, Is = function (t) { var s = 1 + t, i = s - 1; return 0 === i ? t : t * Math.log(s) / i; }, Os = function (t) { var s = Math.abs(t); return s = Is(s * (1 + s / (Ss(1, s) + 1))), t < 0 ? -s : s; }, ks = function (t, s) { for (var i, a = 2 * Math.cos(2 * s), h = t.length - 1, e = t[h], n = 0; --h >= 0;)
        i = a * e - n + t[h], n = e, e = i; return s + i * Math.sin(2 * s); }, qs = function (t, s) { for (var i, a = 2 * Math.cos(s), h = t.length - 1, e = t[h], n = 0; --h >= 0;)
        i = a * e - n + t[h], n = e, e = i; return Math.sin(s) * i; }, Rs = function (t) { var s = Math.exp(t); return s = (s + 1 / s) / 2; }, Ls = function (t, s, i) { for (var a, h, e = Math.sin(s), n = Math.cos(s), r = Ps(i), o = Rs(i), l = 2 * n * o, u = -2 * e * r, c = t.length - 1, M = t[c], f = 0, d = 0, m = 0; --c >= 0;)
        a = d, h = f, M = l * (d = M) - a - u * (f = m) + t[c], m = u * d - h + l * f; return l = e * o, u = n * r, [l * M - u * m, l * m + u * M]; }, Gs = { init: function () { if (!this.approx && (isNaN(this.es) || this.es <= 0))
            throw new Error('Incorrect elliptical usage. Try using the +approx option in the proj string, or PROJECTION["Fast_Transverse_Mercator"] in the WKT.'); this.approx && (Cs.init.apply(this), this.forward = Cs.forward, this.inverse = Cs.inverse), this.x0 = void 0 !== this.x0 ? this.x0 : 0, this.y0 = void 0 !== this.y0 ? this.y0 : 0, this.long0 = void 0 !== this.long0 ? this.long0 : 0, this.lat0 = void 0 !== this.lat0 ? this.lat0 : 0, this.cgb = [], this.cbg = [], this.utg = [], this.gtu = []; var t = this.es / (1 + Math.sqrt(1 - this.es)), s = t / (2 - t), i = s; this.cgb[0] = s * (2 + s * (-2 / 3 + s * (s * (116 / 45 + s * (26 / 45 + s * (-2854 / 675))) - 2))), this.cbg[0] = s * (s * (2 / 3 + s * (4 / 3 + s * (-82 / 45 + s * (32 / 45 + s * (4642 / 4725))))) - 2), i *= s, this.cgb[1] = i * (7 / 3 + s * (s * (-227 / 45 + s * (2704 / 315 + s * (2323 / 945))) - 1.6)), this.cbg[1] = i * (5 / 3 + s * (-16 / 15 + s * (-13 / 9 + s * (904 / 315 + s * (-1522 / 945))))), i *= s, this.cgb[2] = i * (56 / 15 + s * (-136 / 35 + s * (-1262 / 105 + s * (73814 / 2835)))), this.cbg[2] = i * (-26 / 15 + s * (34 / 21 + s * (1.6 + s * (-12686 / 2835)))), i *= s, this.cgb[3] = i * (4279 / 630 + s * (-332 / 35 + s * (-399572 / 14175))), this.cbg[3] = i * (1237 / 630 + s * (s * (-24832 / 14175) - 2.4)), i *= s, this.cgb[4] = i * (4174 / 315 + s * (-144838 / 6237)), this.cbg[4] = i * (-734 / 315 + s * (109598 / 31185)), i *= s, this.cgb[5] = i * (601676 / 22275), this.cbg[5] = i * (444337 / 155925), i = Math.pow(s, 2), this.Qn = this.k0 / (1 + s) * (1 + i * (.25 + i * (1 / 64 + i / 256))), this.utg[0] = s * (s * (2 / 3 + s * (-37 / 96 + s * (1 / 360 + s * (81 / 512 + s * (-96199 / 604800))))) - .5), this.gtu[0] = s * (.5 + s * (-2 / 3 + s * (5 / 16 + s * (41 / 180 + s * (-127 / 288 + s * (7891 / 37800)))))), this.utg[1] = i * (-1 / 48 + s * (-1 / 15 + s * (437 / 1440 + s * (-46 / 105 + s * (1118711 / 3870720))))), this.gtu[1] = i * (13 / 48 + s * (s * (557 / 1440 + s * (281 / 630 + s * (-1983433 / 1935360))) - .6)), i *= s, this.utg[2] = i * (-17 / 480 + s * (37 / 840 + s * (209 / 4480 + s * (-5569 / 90720)))), this.gtu[2] = i * (61 / 240 + s * (-103 / 140 + s * (15061 / 26880 + s * (167603 / 181440)))), i *= s, this.utg[3] = i * (-4397 / 161280 + s * (11 / 504 + s * (830251 / 7257600))), this.gtu[3] = i * (49561 / 161280 + s * (-179 / 168 + s * (6601661 / 7257600))), i *= s, this.utg[4] = i * (-4583 / 161280 + s * (108847 / 3991680)), this.gtu[4] = i * (34729 / 80640 + s * (-3418889 / 1995840)), i *= s, this.utg[5] = -.03233083094085698 * i, this.gtu[5] = .6650675310896665 * i; var a = ks(this.cbg, this.lat0); this.Zb = -this.Qn * (a + qs(this.gtu, 2 * a)); }, forward: function (t) { var s = Vt(t.x - this.long0), i = t.y; i = ks(this.cbg, i); var a = Math.sin(i), h = Math.cos(i), e = Math.sin(s), n = Math.cos(s); i = Math.atan2(a, n * h), s = Math.atan2(e * h, Ss(a, h * n)), s = Os(Math.tan(s)); var r = Ls(this.gtu, 2 * i, 2 * s); i += r[0], s += r[1]; var o, l; return Math.abs(s) <= 2.623395162778 ? (o = this.a * (this.Qn * s) + this.x0, l = this.a * (this.Qn * i + this.Zb) + this.y0) : (o = 1 / 0, l = 1 / 0), t.x = o, t.y = l, t; }, inverse: function (t) { var s = (t.x - this.x0) * (1 / this.a), i = (t.y - this.y0) * (1 / this.a); i = (i - this.Zb) / this.Qn, s /= this.Qn; var a, h; if (Math.abs(s) <= 2.623395162778) {
            var e = Ls(this.utg, 2 * i, 2 * s);
            i += e[0], s += e[1], s = Math.atan(Ps(s));
            var n = Math.sin(i), r = Math.cos(i), o = Math.sin(s), l = Math.cos(s);
            i = Math.atan2(n * l, Ss(o, l * r)), s = Math.atan2(o, l * r), a = Vt(s + this.long0), h = ks(this.cgb, i);
        }
        else
            a = 1 / 0, h = 1 / 0; return t.x = a, t.y = h, t; }, names: ["Extended_Transverse_Mercator", "Extended Transverse Mercator", "etmerc", "Transverse_Mercator", "Transverse Mercator", "Gauss Kruger", "Gauss_Kruger", "tmerc"] }, js = function (t, s) { if (void 0 === t) {
        if ((t = Math.floor(30 * (Vt(s) + Math.PI) / Math.PI) + 1) < 0)
            return 0;
        if (t > 60)
            return 60;
    } return t; }, Ts = { init: function () { var t = js(this.zone, this.long0); if (void 0 === t)
            throw new Error("unknown utm zone"); this.lat0 = 0, this.long0 = (6 * Math.abs(t) - 183) * Pt, this.x0 = 5e5, this.y0 = this.utmSouth ? 1e7 : 0, this.k0 = .9996, Gs.init.apply(this), this.forward = Gs.forward, this.inverse = Gs.inverse; }, names: ["Universal Transverse Mercator System", "utm"], dependsOn: "etmerc" }, Bs = function (t, s) { return Math.pow((1 - t) / (1 + t), s); }, zs = 20, Fs = { init: function () { var t = Math.sin(this.lat0), s = Math.cos(this.lat0); s *= s, this.rc = Math.sqrt(1 - this.es) / (1 - this.es * t * t), this.C = Math.sqrt(1 + this.es * s * s / (1 - this.es)), this.phic0 = Math.asin(t / this.C), this.ratexp = .5 * this.C * this.e, this.K = Math.tan(.5 * this.phic0 + It) / (Math.pow(Math.tan(.5 * this.lat0 + It), this.C) * Bs(this.e * t, this.ratexp)); }, forward: function (t) { var s = t.x, i = t.y; return t.y = 2 * Math.atan(this.K * Math.pow(Math.tan(.5 * i + It), this.C) * Bs(this.e * Math.sin(i), this.ratexp)) - wt, t.x = this.C * s, t; }, inverse: function (t) { for (var s = t.x / this.C, i = t.y, a = Math.pow(Math.tan(.5 * i + It) / this.K, 1 / this.C), h = zs; h > 0 && (i = 2 * Math.atan(a * Bs(this.e * Math.sin(t.y), -.5 * this.e)) - wt, !(Math.abs(i - t.y) < 1e-14)); --h)
            t.y = i; return h ? (t.x = s, t.y = i, t) : null; }, names: ["gauss"] }, Ds = { init: function () { Fs.init.apply(this), this.rc && (this.sinc0 = Math.sin(this.phic0), this.cosc0 = Math.cos(this.phic0), this.R2 = 2 * this.rc, this.title || (this.title = "Oblique Stereographic Alternative")); }, forward: function (t) { var s, i, a, h; return t.x = Vt(t.x - this.long0), Fs.forward.apply(this, [t]), s = Math.sin(t.y), i = Math.cos(t.y), a = Math.cos(t.x), h = this.k0 * this.R2 / (1 + this.sinc0 * s + this.cosc0 * i * a), t.x = h * i * Math.sin(t.x), t.y = h * (this.cosc0 * s - this.sinc0 * i * a), t.x = this.a * t.x + this.x0, t.y = this.a * t.y + this.y0, t; }, inverse: function (t) { var s, i, a, h, e; if (t.x = (t.x - this.x0) / this.a, t.y = (t.y - this.y0) / this.a, t.x /= this.k0, t.y /= this.k0, e = Ss(t.x, t.y)) {
            var n = 2 * Math.atan2(e, this.R2);
            s = Math.sin(n), i = Math.cos(n), h = Math.asin(i * this.sinc0 + t.y * s * this.cosc0 / e), a = Math.atan2(t.x * s, e * this.cosc0 * i - t.y * this.sinc0 * s);
        }
        else
            h = this.phic0, a = 0; return t.x = a, t.y = h, Fs.inverse.apply(this, [t]), t.x = Vt(t.x + this.long0), t; }, names: ["Stereographic_North_Pole", "Oblique_Stereographic", "sterea", "Oblique Stereographic Alternative", "Double_Stereographic"] }, Us = { init: function () { this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.coslat0 = Math.cos(this.lat0), this.sinlat0 = Math.sin(this.lat0), this.sphere ? 1 === this.k0 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= Ct && (this.k0 = .5 * (1 + Jt(this.lat0) * Math.sin(this.lat_ts))) : (Math.abs(this.coslat0) <= Ct && (this.lat0 > 0 ? this.con = 1 : this.con = -1), this.cons = Math.sqrt(Math.pow(1 + this.e, 1 + this.e) * Math.pow(1 - this.e, 1 - this.e)), 1 === this.k0 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= Ct && Math.abs(Math.cos(this.lat_ts)) > Ct && (this.k0 = .5 * this.cons * Kt(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) / Zt(this.e, this.con * this.lat_ts, this.con * Math.sin(this.lat_ts))), this.ms1 = Kt(this.e, this.sinlat0, this.coslat0), this.X0 = 2 * Math.atan(this.ssfn_(this.lat0, this.sinlat0, this.e)) - wt, this.cosX0 = Math.cos(this.X0), this.sinX0 = Math.sin(this.X0)); }, forward: function (t) { var s, i, a, h, e, n, r = t.x, o = t.y, l = Math.sin(o), u = Math.cos(o), c = Vt(r - this.long0); return Math.abs(Math.abs(r - this.long0) - Math.PI) <= Ct && Math.abs(o + this.lat0) <= Ct ? (t.x = NaN, t.y = NaN, t) : this.sphere ? (s = 2 * this.k0 / (1 + this.sinlat0 * l + this.coslat0 * u * Math.cos(c)), t.x = this.a * s * u * Math.sin(c) + this.x0, t.y = this.a * s * (this.coslat0 * l - this.sinlat0 * u * Math.cos(c)) + this.y0, t) : (i = 2 * Math.atan(this.ssfn_(o, l, this.e)) - wt, h = Math.cos(i), a = Math.sin(i), Math.abs(this.coslat0) <= Ct ? (e = Zt(this.e, o * this.con, this.con * l), n = 2 * this.a * this.k0 * e / this.cons, t.x = this.x0 + n * Math.sin(r - this.long0), t.y = this.y0 - this.con * n * Math.cos(r - this.long0), t) : (Math.abs(this.sinlat0) < Ct ? (s = 2 * this.a * this.k0 / (1 + h * Math.cos(c)), t.y = s * a) : (s = 2 * this.a * this.k0 * this.ms1 / (this.cosX0 * (1 + this.sinX0 * a + this.cosX0 * h * Math.cos(c))), t.y = s * (this.cosX0 * a - this.sinX0 * h * Math.cos(c)) + this.y0), t.x = s * h * Math.sin(c) + this.x0, t)); }, inverse: function (t) { t.x -= this.x0, t.y -= this.y0; var s, i, a, h, e, n = Math.sqrt(t.x * t.x + t.y * t.y); if (this.sphere) {
            var r = 2 * Math.atan(n / (2 * this.a * this.k0));
            return s = this.long0, i = this.lat0, n <= Ct ? (t.x = s, t.y = i, t) : (i = Math.asin(Math.cos(r) * this.sinlat0 + t.y * Math.sin(r) * this.coslat0 / n), s = Vt(Math.abs(this.coslat0) < Ct ? this.lat0 > 0 ? this.long0 + Math.atan2(t.x, -1 * t.y) : this.long0 + Math.atan2(t.x, t.y) : this.long0 + Math.atan2(t.x * Math.sin(r), n * this.coslat0 * Math.cos(r) - t.y * this.sinlat0 * Math.sin(r))), t.x = s, t.y = i, t);
        } if (Math.abs(this.coslat0) <= Ct) {
            if (n <= Ct)
                return i = this.lat0, s = this.long0, t.x = s, t.y = i, t;
            t.x *= this.con, t.y *= this.con, a = n * this.cons / (2 * this.a * this.k0), i = this.con * Yt(this.e, a), s = this.con * Vt(this.con * this.long0 + Math.atan2(t.x, -1 * t.y));
        }
        else
            h = 2 * Math.atan(n * this.cosX0 / (2 * this.a * this.k0 * this.ms1)), s = this.long0, n <= Ct ? e = this.X0 : (e = Math.asin(Math.cos(h) * this.sinX0 + t.y * Math.sin(h) * this.cosX0 / n), s = Vt(this.long0 + Math.atan2(t.x * Math.sin(h), n * this.cosX0 * Math.cos(h) - t.y * this.sinX0 * Math.sin(h)))), i = -1 * Yt(this.e, Math.tan(.5 * (wt + e))); return t.x = s, t.y = i, t; }, names: ["stere", "Stereographic_South_Pole", "Polar Stereographic (variant B)", "Polar_Stereographic"], ssfn_: function (t, s, i) { return s *= i, Math.tan(.5 * (wt + t)) * Math.pow((1 - s) / (1 + s), .5 * i); } }, Qs = { init: function () { var t = this.lat0; this.lambda0 = this.long0; var s = Math.sin(t), i = this.a, a = 1 / this.rf, h = 2 * a - Math.pow(a, 2), e = this.e = Math.sqrt(h); this.R = this.k0 * i * Math.sqrt(1 - h) / (1 - h * Math.pow(s, 2)), this.alpha = Math.sqrt(1 + h / (1 - h) * Math.pow(Math.cos(t), 4)), this.b0 = Math.asin(s / this.alpha); var n = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2)), r = Math.log(Math.tan(Math.PI / 4 + t / 2)), o = Math.log((1 + e * s) / (1 - e * s)); this.K = n - this.alpha * r + this.alpha * e / 2 * o; }, forward: function (t) { var s = Math.log(Math.tan(Math.PI / 4 - t.y / 2)), i = this.e / 2 * Math.log((1 + this.e * Math.sin(t.y)) / (1 - this.e * Math.sin(t.y))), a = -this.alpha * (s + i) + this.K, h = 2 * (Math.atan(Math.exp(a)) - Math.PI / 4), e = this.alpha * (t.x - this.lambda0), n = Math.atan(Math.sin(e) / (Math.sin(this.b0) * Math.tan(h) + Math.cos(this.b0) * Math.cos(e))), r = Math.asin(Math.cos(this.b0) * Math.sin(h) - Math.sin(this.b0) * Math.cos(h) * Math.cos(e)); return t.y = this.R / 2 * Math.log((1 + Math.sin(r)) / (1 - Math.sin(r))) + this.y0, t.x = this.R * n + this.x0, t; }, inverse: function (t) { for (var s = t.x - this.x0, i = t.y - this.y0, a = s / this.R, h = 2 * (Math.atan(Math.exp(i / this.R)) - Math.PI / 4), e = Math.asin(Math.cos(this.b0) * Math.sin(h) + Math.sin(this.b0) * Math.cos(h) * Math.cos(a)), n = Math.atan(Math.sin(a) / (Math.cos(this.b0) * Math.cos(a) - Math.sin(this.b0) * Math.tan(h))), r = this.lambda0 + n / this.alpha, o = 0, l = e, u = -1e3, c = 0; Math.abs(l - u) > 1e-7;) {
            if (++c > 20)
                return;
            o = 1 / this.alpha * (Math.log(Math.tan(Math.PI / 4 + e / 2)) - this.K) + this.e * Math.log(Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(l)) / 2)), u = l, l = 2 * Math.atan(Math.exp(o)) - Math.PI / 2;
        } return t.x = r, t.y = l, t; }, names: ["somerc"] }, Ws = 1e-7, Hs = { init: function () { var t, s, i, a, h, e, n, r, o, l, u, c = 0, M = 0, f = 0, d = 0, m = 0, p = 0, y = 0; this.no_off = rt(this), this.no_rot = "no_rot" in this; var _ = !1; "alpha" in this && (_ = !0); var x = !1; if ("rectified_grid_angle" in this && (x = !0), _ && (y = this.alpha), x && (c = this.rectified_grid_angle * Pt), _ || x)
            M = this.longc;
        else if (f = this.long1, m = this.lat1, d = this.long2, p = this.lat2, Math.abs(m - p) <= Ws || (t = Math.abs(m)) <= Ws || Math.abs(t - wt) <= Ws || Math.abs(Math.abs(this.lat0) - wt) <= Ws || Math.abs(Math.abs(p) - wt) <= Ws)
            throw new Error; var g = 1 - this.es; s = Math.sqrt(g), Math.abs(this.lat0) > Ct ? (r = Math.sin(this.lat0), i = Math.cos(this.lat0), t = 1 - this.es * r * r, this.B = i * i, this.B = Math.sqrt(1 + this.es * this.B * this.B / g), this.A = this.B * this.k0 * s / t, (h = (a = this.B * s / (i * Math.sqrt(t))) * a - 1) <= 0 ? h = 0 : (h = Math.sqrt(h), this.lat0 < 0 && (h = -h)), this.E = h += a, this.E *= Math.pow(Zt(this.e, this.lat0, r), this.B)) : (this.B = 1 / s, this.A = this.k0, this.E = a = h = 1), _ || x ? (_ ? (u = Math.asin(Math.sin(y) / a), x || (c = y)) : (u = c, y = Math.asin(a * Math.sin(u))), this.lam0 = M - Math.asin(.5 * (h - 1 / h) * Math.tan(u)) / this.B) : (e = Math.pow(Zt(this.e, m, Math.sin(m)), this.B), n = Math.pow(Zt(this.e, p, Math.sin(p)), this.B), h = this.E / e, o = (n - e) / (n + e), l = ((l = this.E * this.E) - n * e) / (l + n * e), (t = f - d) < -Math.pi ? d -= Ot : t > Math.pi && (d += Ot), this.lam0 = Vt(.5 * (f + d) - Math.atan(l * Math.tan(.5 * this.B * (f - d)) / o) / this.B), u = Math.atan(2 * Math.sin(this.B * Vt(f - this.lam0)) / (h - 1 / h)), c = y = Math.asin(a * Math.sin(u))), this.singam = Math.sin(u), this.cosgam = Math.cos(u), this.sinrot = Math.sin(c), this.cosrot = Math.cos(c), this.rB = 1 / this.B, this.ArB = this.A * this.rB, this.BrA = 1 / this.ArB, this.no_off ? this.u_0 = 0 : (this.u_0 = Math.abs(this.ArB * Math.atan(Math.sqrt(a * a - 1) / Math.cos(y))), this.lat0 < 0 && (this.u_0 = -this.u_0)), h = .5 * u, this.v_pole_n = this.ArB * Math.log(Math.tan(It - h)), this.v_pole_s = this.ArB * Math.log(Math.tan(It + h)); }, forward: function (t) { var s, i, a, h, e, n, r, o, l = {}; if (t.x = t.x - this.lam0, Math.abs(Math.abs(t.y) - wt) > Ct) {
            if (e = this.E / Math.pow(Zt(this.e, t.y, Math.sin(t.y)), this.B), n = 1 / e, s = .5 * (e - n), i = .5 * (e + n), h = Math.sin(this.B * t.x), a = (s * this.singam - h * this.cosgam) / i, Math.abs(Math.abs(a) - 1) < Ct)
                throw new Error;
            o = .5 * this.ArB * Math.log((1 - a) / (1 + a)), n = Math.cos(this.B * t.x), r = Math.abs(n) < Ws ? this.A * t.x : this.ArB * Math.atan2(s * this.cosgam + h * this.singam, n);
        }
        else
            o = t.y > 0 ? this.v_pole_n : this.v_pole_s, r = this.ArB * t.y; return this.no_rot ? (l.x = r, l.y = o) : (r -= this.u_0, l.x = o * this.cosrot + r * this.sinrot, l.y = r * this.cosrot - o * this.sinrot), l.x = this.a * l.x + this.x0, l.y = this.a * l.y + this.y0, l; }, inverse: function (t) { var s, i, a, h, e, n, r, o = {}; if (t.x = (t.x - this.x0) * (1 / this.a), t.y = (t.y - this.y0) * (1 / this.a), this.no_rot ? (i = t.y, s = t.x) : (i = t.x * this.cosrot - t.y * this.sinrot, s = t.y * this.cosrot + t.x * this.sinrot + this.u_0), a = Math.exp(-this.BrA * i), h = .5 * (a - 1 / a), e = .5 * (a + 1 / a), n = Math.sin(this.BrA * s), r = (n * this.cosgam + h * this.singam) / e, Math.abs(Math.abs(r) - 1) < Ct)
            o.x = 0, o.y = r < 0 ? -wt : wt;
        else {
            if (o.y = this.E / Math.sqrt((1 + r) / (1 - r)), o.y = Yt(this.e, Math.pow(o.y, 1 / this.B)), o.y === 1 / 0)
                throw new Error;
            o.x = -this.rB * Math.atan2(h * this.cosgam - n * this.singam, Math.cos(this.BrA * s));
        } return o.x += this.lam0, o; }, names: ["Hotine_Oblique_Mercator", "Hotine Oblique Mercator", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin", "Hotine_Oblique_Mercator_Two_Point_Natural_Origin", "Hotine_Oblique_Mercator_Azimuth_Center", "Oblique_Mercator", "omerc"] }, Xs = { init: function () { if (this.lat2 || (this.lat2 = this.lat1), this.k0 || (this.k0 = 1), this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, !(Math.abs(this.lat1 + this.lat2) < Ct)) {
            var t = this.b / this.a;
            this.e = Math.sqrt(1 - t * t);
            var s = Math.sin(this.lat1), i = Math.cos(this.lat1), a = Kt(this.e, s, i), h = Zt(this.e, this.lat1, s), e = Math.sin(this.lat2), n = Math.cos(this.lat2), r = Kt(this.e, e, n), o = Zt(this.e, this.lat2, e), l = Zt(this.e, this.lat0, Math.sin(this.lat0));
            Math.abs(this.lat1 - this.lat2) > Ct ? this.ns = Math.log(a / r) / Math.log(h / o) : this.ns = s, isNaN(this.ns) && (this.ns = s), this.f0 = a / (this.ns * Math.pow(h, this.ns)), this.rh = this.a * this.f0 * Math.pow(l, this.ns), this.title || (this.title = "Lambert Conformal Conic");
        } }, forward: function (t) { var s = t.x, i = t.y; Math.abs(2 * Math.abs(i) - Math.PI) <= Ct && (i = Jt(i) * (wt - 2 * Ct)); var a, h, e = Math.abs(Math.abs(i) - wt); if (e > Ct)
            a = Zt(this.e, i, Math.sin(i)), h = this.a * this.f0 * Math.pow(a, this.ns);
        else {
            if ((e = i * this.ns) <= 0)
                return null;
            h = 0;
        } var n = this.ns * Vt(s - this.long0); return t.x = this.k0 * (h * Math.sin(n)) + this.x0, t.y = this.k0 * (this.rh - h * Math.cos(n)) + this.y0, t; }, inverse: function (t) { var s, i, a, h, e, n = (t.x - this.x0) / this.k0, r = this.rh - (t.y - this.y0) / this.k0; this.ns > 0 ? (s = Math.sqrt(n * n + r * r), i = 1) : (s = -Math.sqrt(n * n + r * r), i = -1); var o = 0; if (0 !== s && (o = Math.atan2(i * n, i * r)), 0 !== s || this.ns > 0) {
            if (i = 1 / this.ns, a = Math.pow(s / (this.a * this.f0), i), -9999 === (h = Yt(this.e, a)))
                return null;
        }
        else
            h = -wt; return e = Vt(o / this.ns + this.long0), t.x = e, t.y = h, t; }, names: ["Lambert Tangential Conformal Conic Projection", "Lambert_Conformal_Conic", "Lambert_Conformal_Conic_1SP", "Lambert_Conformal_Conic_2SP", "lcc", "Lambert Conic Conformal (1SP)", "Lambert Conic Conformal (2SP)"] }, Ks = { init: function () { this.a = 6377397.155, this.es = .006674372230614, this.e = Math.sqrt(this.es), this.lat0 || (this.lat0 = .863937979737193), this.long0 || (this.long0 = .4334234309119251), this.k0 || (this.k0 = .9999), this.s45 = .785398163397448, this.s90 = 2 * this.s45, this.fi0 = this.lat0, this.e2 = this.es, this.e = Math.sqrt(this.e2), this.alfa = Math.sqrt(1 + this.e2 * Math.pow(Math.cos(this.fi0), 4) / (1 - this.e2)), this.uq = 1.04216856380474, this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa), this.g = Math.pow((1 + this.e * Math.sin(this.fi0)) / (1 - this.e * Math.sin(this.fi0)), this.alfa * this.e / 2), this.k = Math.tan(this.u0 / 2 + this.s45) / Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa) * this.g, this.k1 = this.k0, this.n0 = this.a * Math.sqrt(1 - this.e2) / (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2)), this.s0 = 1.37008346281555, this.n = Math.sin(this.s0), this.ro0 = this.k1 * this.n0 / Math.tan(this.s0), this.ad = this.s90 - this.uq; }, forward: function (t) { var s, i, a, h, e, n, r, o = t.x, l = t.y, u = Vt(o - this.long0); return s = Math.pow((1 + this.e * Math.sin(l)) / (1 - this.e * Math.sin(l)), this.alfa * this.e / 2), i = 2 * (Math.atan(this.k * Math.pow(Math.tan(l / 2 + this.s45), this.alfa) / s) - this.s45), a = -u * this.alfa, h = Math.asin(Math.cos(this.ad) * Math.sin(i) + Math.sin(this.ad) * Math.cos(i) * Math.cos(a)), e = Math.asin(Math.cos(i) * Math.sin(a) / Math.cos(h)), n = this.n * e, r = this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n) / Math.pow(Math.tan(h / 2 + this.s45), this.n), t.y = r * Math.cos(n) / 1, t.x = r * Math.sin(n) / 1, this.czech || (t.y *= -1, t.x *= -1), t; }, inverse: function (t) { var s, i, a, h, e, n, r, o = t.x; t.x = t.y, t.y = o, this.czech || (t.y *= -1, t.x *= -1), e = Math.sqrt(t.x * t.x + t.y * t.y), h = Math.atan2(t.y, t.x) / Math.sin(this.s0), a = 2 * (Math.atan(Math.pow(this.ro0 / e, 1 / this.n) * Math.tan(this.s0 / 2 + this.s45)) - this.s45), s = Math.asin(Math.cos(this.ad) * Math.sin(a) - Math.sin(this.ad) * Math.cos(a) * Math.cos(h)), i = Math.asin(Math.cos(a) * Math.sin(h) / Math.cos(s)), t.x = this.long0 - i / this.alfa, n = s, r = 0; var l = 0; do {
            t.y = 2 * (Math.atan(Math.pow(this.k, -1 / this.alfa) * Math.pow(Math.tan(s / 2 + this.s45), 1 / this.alfa) * Math.pow((1 + this.e * Math.sin(n)) / (1 - this.e * Math.sin(n)), this.e / 2)) - this.s45), Math.abs(n - t.y) < 1e-10 && (r = 1), n = t.y, l += 1;
        } while (0 === r && l < 15); return l >= 15 ? null : t; }, names: ["Krovak", "krovak"] }, Js = function (t, s, i, a, h) { return t * h - s * Math.sin(2 * h) + i * Math.sin(4 * h) - a * Math.sin(6 * h); }, Vs = function (t) { return 1 - .25 * t * (1 + t / 16 * (3 + 1.25 * t)); }, Zs = function (t) { return .375 * t * (1 + .25 * t * (1 + .46875 * t)); }, Ys = function (t) { return .05859375 * t * t * (1 + .75 * t); }, $s = function (t) { return t * t * t * (35 / 3072); }, ti = function (t, s, i) { var a = s * i; return t / Math.sqrt(1 - a * a); }, si = function (t) { return Math.abs(t) < wt ? t : t - Jt(t) * Math.PI; }, ii = function (t, s, i, a, h) { var e, n; e = t / s; for (var r = 0; r < 15; r++)
        if (n = (t - (s * e - i * Math.sin(2 * e) + a * Math.sin(4 * e) - h * Math.sin(6 * e))) / (s - 2 * i * Math.cos(2 * e) + 4 * a * Math.cos(4 * e) - 6 * h * Math.cos(6 * e)), e += n, Math.abs(n) <= 1e-10)
            return e; return NaN; }, ai = { init: function () { this.sphere || (this.e0 = Vs(this.es), this.e1 = Zs(this.es), this.e2 = Ys(this.es), this.e3 = $s(this.es), this.ml0 = this.a * Js(this.e0, this.e1, this.e2, this.e3, this.lat0)); }, forward: function (t) { var s, i, a = t.x, h = t.y; if (a = Vt(a - this.long0), this.sphere)
            s = this.a * Math.asin(Math.cos(h) * Math.sin(a)), i = this.a * (Math.atan2(Math.tan(h), Math.cos(a)) - this.lat0);
        else {
            var e = Math.sin(h), n = Math.cos(h), r = ti(this.a, this.e, e), o = Math.tan(h) * Math.tan(h), l = a * Math.cos(h), u = l * l, c = this.es * n * n / (1 - this.es);
            s = r * l * (1 - u * o * (1 / 6 - (8 - o + 8 * c) * u / 120)), i = this.a * Js(this.e0, this.e1, this.e2, this.e3, h) - this.ml0 + r * e / n * u * (.5 + (5 - o + 6 * c) * u / 24);
        } return t.x = s + this.x0, t.y = i + this.y0, t; }, inverse: function (t) { t.x -= this.x0, t.y -= this.y0; var s, i, a = t.x / this.a, h = t.y / this.a; if (this.sphere) {
            var e = h + this.lat0;
            s = Math.asin(Math.sin(e) * Math.cos(a)), i = Math.atan2(Math.tan(a), Math.cos(e));
        }
        else {
            var n = this.ml0 / this.a + h, r = ii(n, this.e0, this.e1, this.e2, this.e3);
            if (Math.abs(Math.abs(r) - wt) <= Ct)
                return t.x = this.long0, t.y = wt, h < 0 && (t.y *= -1), t;
            var o = ti(this.a, this.e, Math.sin(r)), l = o * o * o / this.a / this.a * (1 - this.es), u = Math.pow(Math.tan(r), 2), c = a * this.a / o, M = c * c;
            s = r - o * Math.tan(r) / l * c * c * (.5 - (1 + 3 * u) * c * c / 24), i = c * (1 - M * (u / 3 + (1 + 3 * u) * u * M / 15)) / Math.cos(r);
        } return t.x = Vt(i + this.long0), t.y = si(s), t; }, names: ["Cassini", "Cassini_Soldner", "cass"] }, hi = function (t, s) { var i; return t > 1e-7 ? (i = t * s, (1 - t * t) * (s / (1 - i * i) - .5 / t * Math.log((1 - i) / (1 + i)))) : 2 * s; }, ei = .3333333333333333, ni = .17222222222222222, ri = .10257936507936508, oi = .06388888888888888, li = .0664021164021164, ui = .016415012942191543, ci = { init: function () { var t = Math.abs(this.lat0); if (Math.abs(t - wt) < Ct ? this.mode = this.lat0 < 0 ? this.S_POLE : this.N_POLE : Math.abs(t) < Ct ? this.mode = this.EQUIT : this.mode = this.OBLIQ, this.es > 0) {
            var s;
            switch (this.qp = hi(this.e, 1), this.mmf = .5 / (1 - this.es), this.apa = ot(this.es), this.mode) {
                case this.N_POLE:
                case this.S_POLE:
                    this.dd = 1;
                    break;
                case this.EQUIT:
                    this.rq = Math.sqrt(.5 * this.qp), this.dd = 1 / this.rq, this.xmf = 1, this.ymf = .5 * this.qp;
                    break;
                case this.OBLIQ: this.rq = Math.sqrt(.5 * this.qp), s = Math.sin(this.lat0), this.sinb1 = hi(this.e, s) / this.qp, this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1), this.dd = Math.cos(this.lat0) / (Math.sqrt(1 - this.es * s * s) * this.rq * this.cosb1), this.ymf = (this.xmf = this.rq) / this.dd, this.xmf *= this.dd;
            }
        }
        else
            this.mode === this.OBLIQ && (this.sinph0 = Math.sin(this.lat0), this.cosph0 = Math.cos(this.lat0)); }, forward: function (t) { var s, i, a, h, e, n, r, o, l, u, c = t.x, M = t.y; if (c = Vt(c - this.long0), this.sphere) {
            if (e = Math.sin(M), u = Math.cos(M), a = Math.cos(c), this.mode === this.OBLIQ || this.mode === this.EQUIT) {
                if ((i = this.mode === this.EQUIT ? 1 + u * a : 1 + this.sinph0 * e + this.cosph0 * u * a) <= Ct)
                    return null;
                s = (i = Math.sqrt(2 / i)) * u * Math.sin(c), i *= this.mode === this.EQUIT ? e : this.cosph0 * e - this.sinph0 * u * a;
            }
            else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
                if (this.mode === this.N_POLE && (a = -a), Math.abs(M + this.lat0) < Ct)
                    return null;
                i = It - .5 * M, s = (i = 2 * (this.mode === this.S_POLE ? Math.cos(i) : Math.sin(i))) * Math.sin(c), i *= a;
            }
        }
        else {
            switch (r = 0, o = 0, l = 0, a = Math.cos(c), h = Math.sin(c), e = Math.sin(M), n = hi(this.e, e), this.mode !== this.OBLIQ && this.mode !== this.EQUIT || (r = n / this.qp, o = Math.sqrt(1 - r * r)), this.mode) {
                case this.OBLIQ:
                    l = 1 + this.sinb1 * r + this.cosb1 * o * a;
                    break;
                case this.EQUIT:
                    l = 1 + o * a;
                    break;
                case this.N_POLE:
                    l = wt + M, n = this.qp - n;
                    break;
                case this.S_POLE: l = M - wt, n = this.qp + n;
            }
            if (Math.abs(l) < Ct)
                return null;
            switch (this.mode) {
                case this.OBLIQ:
                case this.EQUIT:
                    l = Math.sqrt(2 / l), i = this.mode === this.OBLIQ ? this.ymf * l * (this.cosb1 * r - this.sinb1 * o * a) : (l = Math.sqrt(2 / (1 + o * a))) * r * this.ymf, s = this.xmf * l * o * h;
                    break;
                case this.N_POLE:
                case this.S_POLE: n >= 0 ? (s = (l = Math.sqrt(n)) * h, i = a * (this.mode === this.S_POLE ? l : -l)) : s = i = 0;
            }
        } return t.x = this.a * s + this.x0, t.y = this.a * i + this.y0, t; }, inverse: function (t) { t.x -= this.x0, t.y -= this.y0; var s, i, a, h, e, n, r, o = t.x / this.a, l = t.y / this.a; if (this.sphere) {
            var u, c = 0, M = 0;
            if (u = Math.sqrt(o * o + l * l), (i = .5 * u) > 1)
                return null;
            switch (i = 2 * Math.asin(i), this.mode !== this.OBLIQ && this.mode !== this.EQUIT || (M = Math.sin(i), c = Math.cos(i)), this.mode) {
                case this.EQUIT:
                    i = Math.abs(u) <= Ct ? 0 : Math.asin(l * M / u), o *= M, l = c * u;
                    break;
                case this.OBLIQ:
                    i = Math.abs(u) <= Ct ? this.lat0 : Math.asin(c * this.sinph0 + l * M * this.cosph0 / u), o *= M * this.cosph0, l = (c - Math.sin(i) * this.sinph0) * u;
                    break;
                case this.N_POLE:
                    l = -l, i = wt - i;
                    break;
                case this.S_POLE: i -= wt;
            }
            s = 0 !== l || this.mode !== this.EQUIT && this.mode !== this.OBLIQ ? Math.atan2(o, l) : 0;
        }
        else {
            if (r = 0, this.mode === this.OBLIQ || this.mode === this.EQUIT) {
                if (o /= this.dd, l *= this.dd, (n = Math.sqrt(o * o + l * l)) < Ct)
                    return t.x = this.long0, t.y = this.lat0, t;
                h = 2 * Math.asin(.5 * n / this.rq), a = Math.cos(h), o *= h = Math.sin(h), this.mode === this.OBLIQ ? (r = a * this.sinb1 + l * h * this.cosb1 / n, e = this.qp * r, l = n * this.cosb1 * a - l * this.sinb1 * h) : (r = l * h / n, e = this.qp * r, l = n * a);
            }
            else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
                if (this.mode === this.N_POLE && (l = -l), !(e = o * o + l * l))
                    return t.x = this.long0, t.y = this.lat0, t;
                r = 1 - e / this.qp, this.mode === this.S_POLE && (r = -r);
            }
            s = Math.atan2(o, l), i = lt(Math.asin(r), this.apa);
        } return t.x = Vt(this.long0 + s), t.y = i, t; }, names: ["Lambert Azimuthal Equal Area", "Lambert_Azimuthal_Equal_Area", "laea"], S_POLE: 1, N_POLE: 2, EQUIT: 3, OBLIQ: 4 }, Mi = function (t) { return Math.abs(t) > 1 && (t = t > 1 ? 1 : -1), Math.asin(t); }, fi = { init: function () { Math.abs(this.lat1 + this.lat2) < Ct || (this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e3 = Math.sqrt(this.es), this.sin_po = Math.sin(this.lat1), this.cos_po = Math.cos(this.lat1), this.t1 = this.sin_po, this.con = this.sin_po, this.ms1 = Kt(this.e3, this.sin_po, this.cos_po), this.qs1 = hi(this.e3, this.sin_po), this.sin_po = Math.sin(this.lat2), this.cos_po = Math.cos(this.lat2), this.t2 = this.sin_po, this.ms2 = Kt(this.e3, this.sin_po, this.cos_po), this.qs2 = hi(this.e3, this.sin_po), this.sin_po = Math.sin(this.lat0), this.cos_po = Math.cos(this.lat0), this.t3 = this.sin_po, this.qs0 = hi(this.e3, this.sin_po), Math.abs(this.lat1 - this.lat2) > Ct ? this.ns0 = (this.ms1 * this.ms1 - this.ms2 * this.ms2) / (this.qs2 - this.qs1) : this.ns0 = this.con, this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1, this.rh = this.a * Math.sqrt(this.c - this.ns0 * this.qs0) / this.ns0); }, forward: function (t) { var s = t.x, i = t.y; this.sin_phi = Math.sin(i), this.cos_phi = Math.cos(i); var a = hi(this.e3, this.sin_phi), h = this.a * Math.sqrt(this.c - this.ns0 * a) / this.ns0, e = this.ns0 * Vt(s - this.long0), n = h * Math.sin(e) + this.x0, r = this.rh - h * Math.cos(e) + this.y0; return t.x = n, t.y = r, t; }, inverse: function (t) { var s, i, a, h, e, n; return t.x -= this.x0, t.y = this.rh - t.y + this.y0, this.ns0 >= 0 ? (s = Math.sqrt(t.x * t.x + t.y * t.y), a = 1) : (s = -Math.sqrt(t.x * t.x + t.y * t.y), a = -1), h = 0, 0 !== s && (h = Math.atan2(a * t.x, a * t.y)), a = s * this.ns0 / this.a, this.sphere ? n = Math.asin((this.c - a * a) / (2 * this.ns0)) : (i = (this.c - a * a) / this.ns0, n = this.phi1z(this.e3, i)), e = Vt(h / this.ns0 + this.long0), t.x = e, t.y = n, t; }, names: ["Albers_Conic_Equal_Area", "Albers", "aea"], phi1z: function (t, s) { var i, a, h, e, n, r = Mi(.5 * s); if (t < Ct)
            return r; for (var o = t * t, l = 1; l <= 25; l++)
            if (i = Math.sin(r), a = Math.cos(r), h = t * i, e = 1 - h * h, n = .5 * e * e / a * (s / (1 - o) - i / e + .5 / t * Math.log((1 - h) / (1 + h))), r += n, Math.abs(n) <= 1e-7)
                return r; return null; } }, di = { init: function () { this.sin_p14 = Math.sin(this.lat0), this.cos_p14 = Math.cos(this.lat0), this.infinity_dist = 1e3 * this.a, this.rc = 1; }, forward: function (t) { var s, i, a, h, e, n, r, o = t.x, l = t.y; return a = Vt(o - this.long0), s = Math.sin(l), i = Math.cos(l), h = Math.cos(a), (e = this.sin_p14 * s + this.cos_p14 * i * h) > 0 || Math.abs(e) <= Ct ? (n = this.x0 + 1 * this.a * i * Math.sin(a) / e, r = this.y0 + 1 * this.a * (this.cos_p14 * s - this.sin_p14 * i * h) / e) : (n = this.x0 + this.infinity_dist * i * Math.sin(a), r = this.y0 + this.infinity_dist * (this.cos_p14 * s - this.sin_p14 * i * h)), t.x = n, t.y = r, t; }, inverse: function (t) { var s, i, a, h, e, n; return t.x = (t.x - this.x0) / this.a, t.y = (t.y - this.y0) / this.a, t.x /= this.k0, t.y /= this.k0, (s = Math.sqrt(t.x * t.x + t.y * t.y)) ? (h = Math.atan2(s, this.rc), i = Math.sin(h), a = Math.cos(h), n = Mi(a * this.sin_p14 + t.y * i * this.cos_p14 / s), e = Math.atan2(t.x * i, s * this.cos_p14 * a - t.y * this.sin_p14 * i), e = Vt(this.long0 + e)) : (n = this.phic0, e = 0), t.x = e, t.y = n, t; }, names: ["gnom"] }, mi = function (t, s) { var i = 1 - (1 - t * t) / (2 * t) * Math.log((1 - t) / (1 + t)); if (Math.abs(Math.abs(s) - i) < 1e-6)
        return s < 0 ? -1 * wt : wt; for (var a, h, e, n, r = Math.asin(.5 * s), o = 0; o < 30; o++)
        if (h = Math.sin(r), e = Math.cos(r), n = t * h, a = Math.pow(1 - n * n, 2) / (2 * e) * (s / (1 - t * t) - h / (1 - n * n) + .5 / t * Math.log((1 - n) / (1 + n))), r += a, Math.abs(a) <= 1e-10)
            return r; return NaN; }, pi = { init: function () { this.sphere || (this.k0 = Kt(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts))); }, forward: function (t) { var s, i, a = t.x, h = t.y, e = Vt(a - this.long0); if (this.sphere)
            s = this.x0 + this.a * e * Math.cos(this.lat_ts), i = this.y0 + this.a * Math.sin(h) / Math.cos(this.lat_ts);
        else {
            var n = hi(this.e, Math.sin(h));
            s = this.x0 + this.a * this.k0 * e, i = this.y0 + this.a * n * .5 / this.k0;
        } return t.x = s, t.y = i, t; }, inverse: function (t) { t.x -= this.x0, t.y -= this.y0; var s, i; return this.sphere ? (s = Vt(this.long0 + t.x / this.a / Math.cos(this.lat_ts)), i = Math.asin(t.y / this.a * Math.cos(this.lat_ts))) : (i = mi(this.e, 2 * t.y * this.k0 / this.a), s = Vt(this.long0 + t.x / (this.a * this.k0))), t.x = s, t.y = i, t; }, names: ["cea"] }, yi = { init: function () { this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.lat_ts = this.lat_ts || 0, this.title = this.title || "Equidistant Cylindrical (Plate Carre)", this.rc = Math.cos(this.lat_ts); }, forward: function (t) { var s = t.x, i = t.y, a = Vt(s - this.long0), h = si(i - this.lat0); return t.x = this.x0 + this.a * a * this.rc, t.y = this.y0 + this.a * h, t; }, inverse: function (t) { var s = t.x, i = t.y; return t.x = Vt(this.long0 + (s - this.x0) / (this.a * this.rc)), t.y = si(this.lat0 + (i - this.y0) / this.a), t; }, names: ["Equirectangular", "Equidistant_Cylindrical", "eqc"] }, _i = 20, xi = { init: function () { this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = Vs(this.es), this.e1 = Zs(this.es), this.e2 = Ys(this.es), this.e3 = $s(this.es), this.ml0 = this.a * Js(this.e0, this.e1, this.e2, this.e3, this.lat0); }, forward: function (t) { var s, i, a, h = t.x, e = t.y, n = Vt(h - this.long0); if (a = n * Math.sin(e), this.sphere)
            Math.abs(e) <= Ct ? (s = this.a * n, i = -1 * this.a * this.lat0) : (s = this.a * Math.sin(a) / Math.tan(e), i = this.a * (si(e - this.lat0) + (1 - Math.cos(a)) / Math.tan(e)));
        else if (Math.abs(e) <= Ct)
            s = this.a * n, i = -1 * this.ml0;
        else {
            var r = ti(this.a, this.e, Math.sin(e)) / Math.tan(e);
            s = r * Math.sin(a), i = this.a * Js(this.e0, this.e1, this.e2, this.e3, e) - this.ml0 + r * (1 - Math.cos(a));
        } return t.x = s + this.x0, t.y = i + this.y0, t; }, inverse: function (t) { var s, i, a, h, e, n, r, o, l; if (a = t.x - this.x0, h = t.y - this.y0, this.sphere)
            if (Math.abs(h + this.a * this.lat0) <= Ct)
                s = Vt(a / this.a + this.long0), i = 0;
            else {
                n = this.lat0 + h / this.a, r = a * a / this.a / this.a + n * n, o = n;
                var u;
                for (e = _i; e; --e)
                    if (u = Math.tan(o), l = -1 * (n * (o * u + 1) - o - .5 * (o * o + r) * u) / ((o - n) / u - 1), o += l, Math.abs(l) <= Ct) {
                        i = o;
                        break;
                    }
                s = Vt(this.long0 + Math.asin(a * Math.tan(o) / this.a) / Math.sin(i));
            }
        else if (Math.abs(h + this.ml0) <= Ct)
            i = 0, s = Vt(this.long0 + a / this.a);
        else {
            n = (this.ml0 + h) / this.a, r = a * a / this.a / this.a + n * n, o = n;
            var c, M, f, d, m;
            for (e = _i; e; --e)
                if (m = this.e * Math.sin(o), c = Math.sqrt(1 - m * m) * Math.tan(o), M = this.a * Js(this.e0, this.e1, this.e2, this.e3, o), f = this.e0 - 2 * this.e1 * Math.cos(2 * o) + 4 * this.e2 * Math.cos(4 * o) - 6 * this.e3 * Math.cos(6 * o), d = M / this.a, l = (n * (c * d + 1) - d - .5 * c * (d * d + r)) / (this.es * Math.sin(2 * o) * (d * d + r - 2 * n * d) / (4 * c) + (n - d) * (c * f - 2 / Math.sin(2 * o)) - f), o -= l, Math.abs(l) <= Ct) {
                    i = o;
                    break;
                }
            c = Math.sqrt(1 - this.es * Math.pow(Math.sin(i), 2)) * Math.tan(i), s = Vt(this.long0 + Math.asin(a * c / this.a) / Math.sin(i));
        } return t.x = s, t.y = i, t; }, names: ["Polyconic", "poly"] }, gi = { init: function () { this.A = [], this.A[1] = .6399175073, this.A[2] = -.1358797613, this.A[3] = .063294409, this.A[4] = -.02526853, this.A[5] = .0117879, this.A[6] = -.0055161, this.A[7] = .0026906, this.A[8] = -.001333, this.A[9] = 67e-5, this.A[10] = -34e-5, this.B_re = [], this.B_im = [], this.B_re[1] = .7557853228, this.B_im[1] = 0, this.B_re[2] = .249204646, this.B_im[2] = .003371507, this.B_re[3] = -.001541739, this.B_im[3] = .04105856, this.B_re[4] = -.10162907, this.B_im[4] = .01727609, this.B_re[5] = -.26623489, this.B_im[5] = -.36249218, this.B_re[6] = -.6870983, this.B_im[6] = -1.1651967, this.C_re = [], this.C_im = [], this.C_re[1] = 1.3231270439, this.C_im[1] = 0, this.C_re[2] = -.577245789, this.C_im[2] = -.007809598, this.C_re[3] = .508307513, this.C_im[3] = -.112208952, this.C_re[4] = -.15094762, this.C_im[4] = .18200602, this.C_re[5] = 1.01418179, this.C_im[5] = 1.64497696, this.C_re[6] = 1.9660549, this.C_im[6] = 2.5127645, this.D = [], this.D[1] = 1.5627014243, this.D[2] = .5185406398, this.D[3] = -.03333098, this.D[4] = -.1052906, this.D[5] = -.0368594, this.D[6] = .007317, this.D[7] = .0122, this.D[8] = .00394, this.D[9] = -.0013; }, forward: function (t) { var s, i = t.x, a = t.y - this.lat0, h = i - this.long0, e = a / bt * 1e-5, n = h, r = 1, o = 0; for (s = 1; s <= 10; s++)
            r *= e, o += this.A[s] * r; var l, u = o, c = n, M = 1, f = 0, d = 0, m = 0; for (s = 1; s <= 6; s++)
            l = f * u + M * c, M = M * u - f * c, f = l, d = d + this.B_re[s] * M - this.B_im[s] * f, m = m + this.B_im[s] * M + this.B_re[s] * f; return t.x = m * this.a + this.x0, t.y = d * this.a + this.y0, t; }, inverse: function (t) { var s, i, a = t.x, h = t.y, e = a - this.x0, n = (h - this.y0) / this.a, r = e / this.a, o = 1, l = 0, u = 0, c = 0; for (s = 1; s <= 6; s++)
            i = l * n + o * r, o = o * n - l * r, l = i, u = u + this.C_re[s] * o - this.C_im[s] * l, c = c + this.C_im[s] * o + this.C_re[s] * l; for (var M = 0; M < this.iterations; M++) {
            var f, d = u, m = c, p = n, y = r;
            for (s = 2; s <= 6; s++)
                f = m * u + d * c, d = d * u - m * c, m = f, p += (s - 1) * (this.B_re[s] * d - this.B_im[s] * m), y += (s - 1) * (this.B_im[s] * d + this.B_re[s] * m);
            d = 1, m = 0;
            var _ = this.B_re[1], x = this.B_im[1];
            for (s = 2; s <= 6; s++)
                f = m * u + d * c, d = d * u - m * c, m = f, _ += s * (this.B_re[s] * d - this.B_im[s] * m), x += s * (this.B_im[s] * d + this.B_re[s] * m);
            var g = _ * _ + x * x;
            u = (p * _ + y * x) / g, c = (y * _ - p * x) / g;
        } var v = u, b = c, w = 1, N = 0; for (s = 1; s <= 9; s++)
            w *= v, N += this.D[s] * w; var E = this.lat0 + N * bt * 1e5, A = this.long0 + b; return t.x = A, t.y = E, t; }, names: ["New_Zealand_Map_Grid", "nzmg"] }, vi = { init: function () { }, forward: function (t) { var s = t.x, i = t.y, a = Vt(s - this.long0), h = this.x0 + this.a * a, e = this.y0 + this.a * Math.log(Math.tan(Math.PI / 4 + i / 2.5)) * 1.25; return t.x = h, t.y = e, t; }, inverse: function (t) { t.x -= this.x0, t.y -= this.y0; var s = Vt(this.long0 + t.x / this.a), i = 2.5 * (Math.atan(Math.exp(.8 * t.y / this.a)) - Math.PI / 4); return t.x = s, t.y = i, t; }, names: ["Miller_Cylindrical", "mill"] }, bi = 20, wi = { init: function () { this.sphere ? (this.n = 1, this.m = 0, this.es = 0, this.C_y = Math.sqrt((this.m + 1) / this.n), this.C_x = this.C_y / (this.m + 1)) : this.en = Ns(this.es); }, forward: function (t) { var s, i, a = t.x, h = t.y; if (a = Vt(a - this.long0), this.sphere) {
            if (this.m)
                for (var e = this.n * Math.sin(h), n = bi; n; --n) {
                    var r = (this.m * h + Math.sin(h) - e) / (this.m + Math.cos(h));
                    if (h -= r, Math.abs(r) < Ct)
                        break;
                }
            else
                h = 1 !== this.n ? Math.asin(this.n * Math.sin(h)) : h;
            s = this.a * this.C_x * a * (this.m + Math.cos(h)), i = this.a * this.C_y * h;
        }
        else {
            var o = Math.sin(h), l = Math.cos(h);
            i = this.a * Es(h, o, l, this.en), s = this.a * a * l / Math.sqrt(1 - this.es * o * o);
        } return t.x = s, t.y = i, t; }, inverse: function (t) { var s, i, a, h; return t.x -= this.x0, a = t.x / this.a, t.y -= this.y0, s = t.y / this.a, this.sphere ? (s /= this.C_y, a /= this.C_x * (this.m + Math.cos(s)), this.m ? s = Mi((this.m * s + Math.sin(s)) / this.n) : 1 !== this.n && (s = Mi(Math.sin(s) / this.n)), a = Vt(a + this.long0), s = si(s)) : (s = As(t.y / this.a, this.es, this.en), (h = Math.abs(s)) < wt ? (h = Math.sin(s), i = this.long0 + t.x * Math.sqrt(1 - this.es * h * h) / (this.a * Math.cos(s)), a = Vt(i)) : h - Ct < wt && (a = this.long0)), t.x = a, t.y = s, t; }, names: ["Sinusoidal", "sinu"] }, Ni = { init: function () { }, forward: function (t) { for (var s = t.x, i = t.y, a = Vt(s - this.long0), h = i, e = Math.PI * Math.sin(i);;) {
            var n = -(h + Math.sin(h) - e) / (1 + Math.cos(h));
            if (h += n, Math.abs(n) < Ct)
                break;
        } h /= 2, Math.PI / 2 - Math.abs(i) < Ct && (a = 0); var r = .900316316158 * this.a * a * Math.cos(h) + this.x0, o = 1.4142135623731 * this.a * Math.sin(h) + this.y0; return t.x = r, t.y = o, t; }, inverse: function (t) { var s, i; t.x -= this.x0, t.y -= this.y0, i = t.y / (1.4142135623731 * this.a), Math.abs(i) > .999999999999 && (i = .999999999999), s = Math.asin(i); var a = Vt(this.long0 + t.x / (.900316316158 * this.a * Math.cos(s))); a < -Math.PI && (a = -Math.PI), a > Math.PI && (a = Math.PI), i = (2 * s + Math.sin(2 * s)) / Math.PI, Math.abs(i) > 1 && (i = 1); var h = Math.asin(i); return t.x = a, t.y = h, t; }, names: ["Mollweide", "moll"] }, Ei = { init: function () { Math.abs(this.lat1 + this.lat2) < Ct || (this.lat2 = this.lat2 || this.lat1, this.temp = this.b / this.a, this.es = 1 - Math.pow(this.temp, 2), this.e = Math.sqrt(this.es), this.e0 = Vs(this.es), this.e1 = Zs(this.es), this.e2 = Ys(this.es), this.e3 = $s(this.es), this.sinphi = Math.sin(this.lat1), this.cosphi = Math.cos(this.lat1), this.ms1 = Kt(this.e, this.sinphi, this.cosphi), this.ml1 = Js(this.e0, this.e1, this.e2, this.e3, this.lat1), Math.abs(this.lat1 - this.lat2) < Ct ? this.ns = this.sinphi : (this.sinphi = Math.sin(this.lat2), this.cosphi = Math.cos(this.lat2), this.ms2 = Kt(this.e, this.sinphi, this.cosphi), this.ml2 = Js(this.e0, this.e1, this.e2, this.e3, this.lat2), this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1)), this.g = this.ml1 + this.ms1 / this.ns, this.ml0 = Js(this.e0, this.e1, this.e2, this.e3, this.lat0), this.rh = this.a * (this.g - this.ml0)); }, forward: function (t) { var s, i = t.x, a = t.y; if (this.sphere)
            s = this.a * (this.g - a);
        else {
            var h = Js(this.e0, this.e1, this.e2, this.e3, a);
            s = this.a * (this.g - h);
        } var e = this.ns * Vt(i - this.long0), n = this.x0 + s * Math.sin(e), r = this.y0 + this.rh - s * Math.cos(e); return t.x = n, t.y = r, t; }, inverse: function (t) { t.x -= this.x0, t.y = this.rh - t.y + this.y0; var s, i, a, h; this.ns >= 0 ? (i = Math.sqrt(t.x * t.x + t.y * t.y), s = 1) : (i = -Math.sqrt(t.x * t.x + t.y * t.y), s = -1); var e = 0; if (0 !== i && (e = Math.atan2(s * t.x, s * t.y)), this.sphere)
            return h = Vt(this.long0 + e / this.ns), a = si(this.g - i / this.a), t.x = h, t.y = a, t; var n = this.g - i / this.a; return a = ii(n, this.e0, this.e1, this.e2, this.e3), h = Vt(this.long0 + e / this.ns), t.x = h, t.y = a, t; }, names: ["Equidistant_Conic", "eqdc"] }, Ai = { init: function () { this.R = this.a; }, forward: function (t) { var s, i, a = t.x, h = t.y, e = Vt(a - this.long0); Math.abs(h) <= Ct && (s = this.x0 + this.R * e, i = this.y0); var n = Mi(2 * Math.abs(h / Math.PI)); (Math.abs(e) <= Ct || Math.abs(Math.abs(h) - wt) <= Ct) && (s = this.x0, i = h >= 0 ? this.y0 + Math.PI * this.R * Math.tan(.5 * n) : this.y0 + Math.PI * this.R * -Math.tan(.5 * n)); var r = .5 * Math.abs(Math.PI / e - e / Math.PI), o = r * r, l = Math.sin(n), u = Math.cos(n), c = u / (l + u - 1), M = c * c, f = c * (2 / l - 1), d = f * f, m = Math.PI * this.R * (r * (c - d) + Math.sqrt(o * (c - d) * (c - d) - (d + o) * (M - d))) / (d + o); e < 0 && (m = -m), s = this.x0 + m; var p = o + c; return m = Math.PI * this.R * (f * p - r * Math.sqrt((d + o) * (o + 1) - p * p)) / (d + o), i = h >= 0 ? this.y0 + m : this.y0 - m, t.x = s, t.y = i, t; }, inverse: function (t) { var s, i, a, h, e, n, r, o, l, u, c, M, f; return t.x -= this.x0, t.y -= this.y0, c = Math.PI * this.R, a = t.x / c, h = t.y / c, e = a * a + h * h, n = -Math.abs(h) * (1 + e), r = n - 2 * h * h + a * a, o = -2 * n + 1 + 2 * h * h + e * e, f = h * h / o + (2 * r * r * r / o / o / o - 9 * n * r / o / o) / 27, l = (n - r * r / 3 / o) / o, u = 2 * Math.sqrt(-l / 3), c = 3 * f / l / u, Math.abs(c) > 1 && (c = c >= 0 ? 1 : -1), M = Math.acos(c) / 3, i = t.y >= 0 ? (-u * Math.cos(M + Math.PI / 3) - r / 3 / o) * Math.PI : -(-u * Math.cos(M + Math.PI / 3) - r / 3 / o) * Math.PI, s = Math.abs(a) < Ct ? this.long0 : Vt(this.long0 + Math.PI * (e - 1 + Math.sqrt(1 + 2 * (a * a - h * h) + e * e)) / 2 / a), t.x = s, t.y = i, t; }, names: ["Van_der_Grinten_I", "VanDerGrinten", "vandg"] }, Ci = { init: function () { this.sin_p12 = Math.sin(this.lat0), this.cos_p12 = Math.cos(this.lat0); }, forward: function (t) { var s, i, a, h, e, n, r, o, l, u, c, M, f, d, m, p, y, _, x, g, v, b, w, N = t.x, E = t.y, A = Math.sin(t.y), C = Math.cos(t.y), P = Vt(N - this.long0); return this.sphere ? Math.abs(this.sin_p12 - 1) <= Ct ? (t.x = this.x0 + this.a * (wt - E) * Math.sin(P), t.y = this.y0 - this.a * (wt - E) * Math.cos(P), t) : Math.abs(this.sin_p12 + 1) <= Ct ? (t.x = this.x0 + this.a * (wt + E) * Math.sin(P), t.y = this.y0 + this.a * (wt + E) * Math.cos(P), t) : (_ = this.sin_p12 * A + this.cos_p12 * C * Math.cos(P), p = Math.acos(_), y = p ? p / Math.sin(p) : 1, t.x = this.x0 + this.a * y * C * Math.sin(P), t.y = this.y0 + this.a * y * (this.cos_p12 * A - this.sin_p12 * C * Math.cos(P)), t) : (s = Vs(this.es), i = Zs(this.es), a = Ys(this.es), h = $s(this.es), Math.abs(this.sin_p12 - 1) <= Ct ? (e = this.a * Js(s, i, a, h, wt), n = this.a * Js(s, i, a, h, E), t.x = this.x0 + (e - n) * Math.sin(P), t.y = this.y0 - (e - n) * Math.cos(P), t) : Math.abs(this.sin_p12 + 1) <= Ct ? (e = this.a * Js(s, i, a, h, wt), n = this.a * Js(s, i, a, h, E), t.x = this.x0 + (e + n) * Math.sin(P), t.y = this.y0 + (e + n) * Math.cos(P), t) : (r = A / C, o = ti(this.a, this.e, this.sin_p12), l = ti(this.a, this.e, A), u = Math.atan((1 - this.es) * r + this.es * o * this.sin_p12 / (l * C)), c = Math.atan2(Math.sin(P), this.cos_p12 * Math.tan(u) - this.sin_p12 * Math.cos(P)), x = 0 === c ? Math.asin(this.cos_p12 * Math.sin(u) - this.sin_p12 * Math.cos(u)) : Math.abs(Math.abs(c) - Math.PI) <= Ct ? -Math.asin(this.cos_p12 * Math.sin(u) - this.sin_p12 * Math.cos(u)) : Math.asin(Math.sin(P) * Math.cos(u) / Math.sin(c)), M = this.e * this.sin_p12 / Math.sqrt(1 - this.es), f = this.e * this.cos_p12 * Math.cos(c) / Math.sqrt(1 - this.es), d = M * f, m = f * f, g = x * x, v = g * x, b = v * x, w = b * x, p = o * x * (1 - g * m * (1 - m) / 6 + v / 8 * d * (1 - 2 * m) + b / 120 * (m * (4 - 7 * m) - 3 * M * M * (1 - 7 * m)) - w / 48 * d), t.x = this.x0 + p * Math.sin(c), t.y = this.y0 + p * Math.cos(c), t)); }, inverse: function (t) { t.x -= this.x0, t.y -= this.y0; var s, i, a, h, e, n, r, o, l, u, c, M, f, d, m, p, y, _, x, g, v, b, w, N; if (this.sphere) {
            if ((s = Math.sqrt(t.x * t.x + t.y * t.y)) > 2 * wt * this.a)
                return;
            return i = s / this.a, a = Math.sin(i), h = Math.cos(i), e = this.long0, Math.abs(s) <= Ct ? n = this.lat0 : (n = Mi(h * this.sin_p12 + t.y * a * this.cos_p12 / s), r = Math.abs(this.lat0) - wt, e = Vt(Math.abs(r) <= Ct ? this.lat0 >= 0 ? this.long0 + Math.atan2(t.x, -t.y) : this.long0 - Math.atan2(-t.x, t.y) : this.long0 + Math.atan2(t.x * a, s * this.cos_p12 * h - t.y * this.sin_p12 * a))), t.x = e, t.y = n, t;
        } return o = Vs(this.es), l = Zs(this.es), u = Ys(this.es), c = $s(this.es), Math.abs(this.sin_p12 - 1) <= Ct ? (M = this.a * Js(o, l, u, c, wt), s = Math.sqrt(t.x * t.x + t.y * t.y), f = M - s, n = ii(f / this.a, o, l, u, c), e = Vt(this.long0 + Math.atan2(t.x, -1 * t.y)), t.x = e, t.y = n, t) : Math.abs(this.sin_p12 + 1) <= Ct ? (M = this.a * Js(o, l, u, c, wt), s = Math.sqrt(t.x * t.x + t.y * t.y), f = s - M, n = ii(f / this.a, o, l, u, c), e = Vt(this.long0 + Math.atan2(t.x, t.y)), t.x = e, t.y = n, t) : (s = Math.sqrt(t.x * t.x + t.y * t.y), p = Math.atan2(t.x, t.y), d = ti(this.a, this.e, this.sin_p12), y = Math.cos(p), _ = this.e * this.cos_p12 * y, x = -_ * _ / (1 - this.es), g = 3 * this.es * (1 - x) * this.sin_p12 * this.cos_p12 * y / (1 - this.es), v = s / d, b = v - x * (1 + x) * Math.pow(v, 3) / 6 - g * (1 + 3 * x) * Math.pow(v, 4) / 24, w = 1 - x * b * b / 2 - v * b * b * b / 6, m = Math.asin(this.sin_p12 * Math.cos(b) + this.cos_p12 * Math.sin(b) * y), e = Vt(this.long0 + Math.asin(Math.sin(p) * Math.sin(b) / Math.cos(m))), N = Math.sin(m), n = Math.atan2((N - this.es * w * this.sin_p12) * Math.tan(m), N * (1 - this.es)), t.x = e, t.y = n, t); }, names: ["Azimuthal_Equidistant", "aeqd"] }, Pi = { init: function () { this.sin_p14 = Math.sin(this.lat0), this.cos_p14 = Math.cos(this.lat0); }, forward: function (t) { var s, i, a, h, e, n, r, o = t.x, l = t.y; return a = Vt(o - this.long0), s = Math.sin(l), i = Math.cos(l), h = Math.cos(a), ((e = this.sin_p14 * s + this.cos_p14 * i * h) > 0 || Math.abs(e) <= Ct) && (n = 1 * this.a * i * Math.sin(a), r = this.y0 + 1 * this.a * (this.cos_p14 * s - this.sin_p14 * i * h)), t.x = n, t.y = r, t; }, inverse: function (t) { var s, i, a, h, e, n, r; return t.x -= this.x0, t.y -= this.y0, s = Math.sqrt(t.x * t.x + t.y * t.y), i = Mi(s / this.a), a = Math.sin(i), h = Math.cos(i), n = this.long0, Math.abs(s) <= Ct ? (r = this.lat0, t.x = n, t.y = r, t) : (r = Mi(h * this.sin_p14 + t.y * a * this.cos_p14 / s), e = Math.abs(this.lat0) - wt, Math.abs(e) <= Ct ? (n = Vt(this.lat0 >= 0 ? this.long0 + Math.atan2(t.x, -t.y) : this.long0 - Math.atan2(-t.x, t.y)), t.x = n, t.y = r, t) : (n = Vt(this.long0 + Math.atan2(t.x * a, s * this.cos_p14 * h - t.y * this.sin_p14 * a)), t.x = n, t.y = r, t)); }, names: ["ortho"] }, Si = { FRONT: 1, RIGHT: 2, BACK: 3, LEFT: 4, TOP: 5, BOTTOM: 6 }, Ii = { AREA_0: 1, AREA_1: 2, AREA_2: 3, AREA_3: 4 }, Oi = { init: function () { this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.lat0 = this.lat0 || 0, this.long0 = this.long0 || 0, this.lat_ts = this.lat_ts || 0, this.title = this.title || "Quadrilateralized Spherical Cube", this.lat0 >= wt - It / 2 ? this.face = Si.TOP : this.lat0 <= -(wt - It / 2) ? this.face = Si.BOTTOM : Math.abs(this.long0) <= It ? this.face = Si.FRONT : Math.abs(this.long0) <= wt + It ? this.face = this.long0 > 0 ? Si.RIGHT : Si.LEFT : this.face = Si.BACK, 0 !== this.es && (this.one_minus_f = 1 - (this.a - this.b) / this.a, this.one_minus_f_squared = this.one_minus_f * this.one_minus_f); }, forward: function (t) { var s, i, a, h, e, n, r = { x: 0, y: 0 }, o = { value: 0 }; if (t.x -= this.long0, s = 0 !== this.es ? Math.atan(this.one_minus_f_squared * Math.tan(t.y)) : t.y, i = t.x, this.face === Si.TOP)
            h = wt - s, i >= It && i <= wt + It ? (o.value = Ii.AREA_0, a = i - wt) : i > wt + It || i <= -(wt + It) ? (o.value = Ii.AREA_1, a = i > 0 ? i - kt : i + kt) : i > -(wt + It) && i <= -It ? (o.value = Ii.AREA_2, a = i + wt) : (o.value = Ii.AREA_3, a = i);
        else if (this.face === Si.BOTTOM)
            h = wt + s, i >= It && i <= wt + It ? (o.value = Ii.AREA_0, a = -i + wt) : i < It && i >= -It ? (o.value = Ii.AREA_1, a = -i) : i < -It && i >= -(wt + It) ? (o.value = Ii.AREA_2, a = -i - wt) : (o.value = Ii.AREA_3, a = i > 0 ? -i + kt : -i - kt);
        else {
            var l, u, c, M, f, d;
            this.face === Si.RIGHT ? i = ct(i, +wt) : this.face === Si.BACK ? i = ct(i, +kt) : this.face === Si.LEFT && (i = ct(i, -wt)), M = Math.sin(s), f = Math.cos(s), d = Math.sin(i), l = f * Math.cos(i), u = f * d, c = M, this.face === Si.FRONT ? a = ut(h = Math.acos(l), c, u, o) : this.face === Si.RIGHT ? a = ut(h = Math.acos(u), c, -l, o) : this.face === Si.BACK ? a = ut(h = Math.acos(-l), c, -u, o) : this.face === Si.LEFT ? a = ut(h = Math.acos(-u), c, l, o) : (h = a = 0, o.value = Ii.AREA_0);
        } return n = Math.atan(12 / kt * (a + Math.acos(Math.sin(a) * Math.cos(It)) - wt)), e = Math.sqrt((1 - Math.cos(h)) / (Math.cos(n) * Math.cos(n)) / (1 - Math.cos(Math.atan(1 / Math.cos(a))))), o.value === Ii.AREA_1 ? n += wt : o.value === Ii.AREA_2 ? n += kt : o.value === Ii.AREA_3 && (n += 1.5 * kt), r.x = e * Math.cos(n), r.y = e * Math.sin(n), r.x = r.x * this.a + this.x0, r.y = r.y * this.a + this.y0, t.x = r.x, t.y = r.y, t; }, inverse: function (t) { var s, i, a, h, e, n, r, o, l, u = { lam: 0, phi: 0 }, c = { value: 0 }; if (t.x = (t.x - this.x0) / this.a, t.y = (t.y - this.y0) / this.a, i = Math.atan(Math.sqrt(t.x * t.x + t.y * t.y)), s = Math.atan2(t.y, t.x), t.x >= 0 && t.x >= Math.abs(t.y) ? c.value = Ii.AREA_0 : t.y >= 0 && t.y >= Math.abs(t.x) ? (c.value = Ii.AREA_1, s -= wt) : t.x < 0 && -t.x >= Math.abs(t.y) ? (c.value = Ii.AREA_2, s = s < 0 ? s + kt : s - kt) : (c.value = Ii.AREA_3, s += wt), l = kt / 12 * Math.tan(s), e = Math.sin(l) / (Math.cos(l) - 1 / Math.sqrt(2)), n = Math.atan(e), a = Math.cos(s), h = Math.tan(i), (r = 1 - a * a * h * h * (1 - Math.cos(Math.atan(1 / Math.cos(n))))) < -1 ? r = -1 : r > 1 && (r = 1), this.face === Si.TOP)
            o = Math.acos(r), u.phi = wt - o, c.value === Ii.AREA_0 ? u.lam = n + wt : c.value === Ii.AREA_1 ? u.lam = n < 0 ? n + kt : n - kt : c.value === Ii.AREA_2 ? u.lam = n - wt : u.lam = n;
        else if (this.face === Si.BOTTOM)
            o = Math.acos(r), u.phi = o - wt, c.value === Ii.AREA_0 ? u.lam = -n + wt : c.value === Ii.AREA_1 ? u.lam = -n : c.value === Ii.AREA_2 ? u.lam = -n - wt : u.lam = n < 0 ? -n - kt : -n + kt;
        else {
            var M, f, d;
            l = (M = r) * M, f = (l += (d = l >= 1 ? 0 : Math.sqrt(1 - l) * Math.sin(n)) * d) >= 1 ? 0 : Math.sqrt(1 - l), c.value === Ii.AREA_1 ? (l = f, f = -d, d = l) : c.value === Ii.AREA_2 ? (f = -f, d = -d) : c.value === Ii.AREA_3 && (l = f, f = d, d = -l), this.face === Si.RIGHT ? (l = M, M = -f, f = l) : this.face === Si.BACK ? (M = -M, f = -f) : this.face === Si.LEFT && (l = M, M = f, f = -l), u.phi = Math.acos(-d) - wt, u.lam = Math.atan2(f, M), this.face === Si.RIGHT ? u.lam = ct(u.lam, -wt) : this.face === Si.BACK ? u.lam = ct(u.lam, -kt) : this.face === Si.LEFT && (u.lam = ct(u.lam, +wt));
        } if (0 !== this.es) {
            var m, p, y;
            m = u.phi < 0 ? 1 : 0, p = Math.tan(u.phi), y = this.b / Math.sqrt(p * p + this.one_minus_f_squared), u.phi = Math.atan(Math.sqrt(this.a * this.a - y * y) / (this.one_minus_f * y)), m && (u.phi = -u.phi);
        } return u.lam += this.long0, t.x = u.lam, t.y = u.phi, t; }, names: ["Quadrilateralized Spherical Cube", "Quadrilateralized_Spherical_Cube", "qsc"] }, ki = [[1, 2.2199e-17, -715515e-10, 31103e-10], [.9986, -482243e-9, -24897e-9, -13309e-10], [.9954, -83103e-8, -448605e-10, -9.86701e-7], [.99, -.00135364, -59661e-9, 36777e-10], [.9822, -.00167442, -449547e-11, -572411e-11], [.973, -.00214868, -903571e-10, 1.8736e-8], [.96, -.00305085, -900761e-10, 164917e-11], [.9427, -.00382792, -653386e-10, -26154e-10], [.9216, -.00467746, -10457e-8, 481243e-11], [.8962, -.00536223, -323831e-10, -543432e-11], [.8679, -.00609363, -113898e-9, 332484e-11], [.835, -.00698325, -640253e-10, 9.34959e-7], [.7986, -.00755338, -500009e-10, 9.35324e-7], [.7597, -.00798324, -35971e-9, -227626e-11], [.7186, -.00851367, -701149e-10, -86303e-10], [.6732, -.00986209, -199569e-9, 191974e-10], [.6213, -.010418, 883923e-10, 624051e-11], [.5722, -.00906601, 182e-6, 624051e-11], [.5322, -.00677797, 275608e-9, 624051e-11]], qi = [[-5.20417e-18, .0124, 1.21431e-18, -8.45284e-11], [.062, .0124, -1.26793e-9, 4.22642e-10], [.124, .0124, 5.07171e-9, -1.60604e-9], [.186, .0123999, -1.90189e-8, 6.00152e-9], [.248, .0124002, 7.10039e-8, -2.24e-8], [.31, .0123992, -2.64997e-7, 8.35986e-8], [.372, .0124029, 9.88983e-7, -3.11994e-7], [.434, .0123893, -369093e-11, -4.35621e-7], [.4958, .0123198, -102252e-10, -3.45523e-7], [.5571, .0121916, -154081e-10, -5.82288e-7], [.6176, .0119938, -241424e-10, -5.25327e-7], [.6769, .011713, -320223e-10, -5.16405e-7], [.7346, .0113541, -397684e-10, -6.09052e-7], [.7903, .0109107, -489042e-10, -104739e-11], [.8435, .0103431, -64615e-9, -1.40374e-9], [.8936, .00969686, -64636e-9, -8547e-9], [.9394, .00840947, -192841e-9, -42106e-10], [.9761, .00616527, -256e-6, -42106e-10], [1, .00328947, -319159e-9, -42106e-10]], Ri = .8487, Li = 1.3523, Gi = St / 5, ji = 1 / Gi, Ti = 18, Bi = function (t, s) { return t[0] + s * (t[1] + s * (t[2] + s * t[3])); }, zi = function (t, s) { return t[1] + s * (2 * t[2] + 3 * s * t[3]); }, Fi = { init: function () { this.x0 = this.x0 || 0, this.y0 = this.y0 || 0, this.long0 = this.long0 || 0, this.es = 0, this.title = this.title || "Robinson"; }, forward: function (t) { var s = Vt(t.x - this.long0), i = Math.abs(t.y), a = Math.floor(i * Gi); a < 0 ? a = 0 : a >= Ti && (a = Ti - 1), i = St * (i - ji * a); var h = { x: Bi(ki[a], i) * s, y: Bi(qi[a], i) }; return t.y < 0 && (h.y = -h.y), h.x = h.x * this.a * Ri + this.x0, h.y = h.y * this.a * Li + this.y0, h; }, inverse: function (t) { var s = { x: (t.x - this.x0) / (this.a * Ri), y: Math.abs(t.y - this.y0) / (this.a * Li) }; if (s.y >= 1)
            s.x /= ki[Ti][0], s.y = t.y < 0 ? -wt : wt;
        else {
            var i = Math.floor(s.y * Ti);
            for (i < 0 ? i = 0 : i >= Ti && (i = Ti - 1);;)
                if (qi[i][0] > s.y)
                    --i;
                else {
                    if (!(qi[i + 1][0] <= s.y))
                        break;
                    ++i;
                }
            var a = qi[i], h = 5 * (s.y - a[0]) / (qi[i + 1][0] - a[0]);
            h = Mt(function (t) { return (Bi(a, t) - s.y) / zi(a, t); }, h, Ct, 100), s.x /= Bi(ki[i], h), s.y = (5 * i + h) * Pt, t.y < 0 && (s.y = -s.y);
        } return s.x = Vt(s.x + this.long0), s; }, names: ["Robinson", "robin"] }, Di = { init: function () { this.name = "geocent"; }, forward: function (t) { return k(t, this.es, this.a); }, inverse: function (t) { return q(t, this.es, this.a, this.b); }, names: ["Geocentric", "geocentric", "geocent", "Geocent"] }, Ui = { N_POLE: 0, S_POLE: 1, EQUIT: 2, OBLIQ: 3 }, Qi = { h: { def: 1e5, num: !0 }, azi: { def: 0, num: !0, degrees: !0 }, tilt: { def: 0, num: !0, degrees: !0 }, long0: { def: 0, num: !0 }, lat0: { def: 0, num: !0 } }, Wi = { init: function () { if (Object.keys(Qi).forEach(function (t) { if (void 0 === this[t])
            this[t] = Qi[t].def;
        else {
            if (Qi[t].num && isNaN(this[t]))
                throw new Error("Invalid parameter value, must be numeric " + t + " = " + this[t]);
            Qi[t].num && (this[t] = parseFloat(this[t]));
        } Qi[t].degrees && (this[t] = this[t] * Pt); }.bind(this)), Math.abs(Math.abs(this.lat0) - wt) < Ct ? this.mode = this.lat0 < 0 ? Ui.S_POLE : Ui.N_POLE : Math.abs(this.lat0) < Ct ? this.mode = Ui.EQUIT : (this.mode = Ui.OBLIQ, this.sinph0 = Math.sin(this.lat0), this.cosph0 = Math.cos(this.lat0)), this.pn1 = this.h / this.a, this.pn1 <= 0 || this.pn1 > 1e10)
            throw new Error("Invalid height"); this.p = 1 + this.pn1, this.rp = 1 / this.p, this.h1 = 1 / this.pn1, this.pfact = (this.p + 1) * this.h1, this.es = 0; var t = this.tilt, s = this.azi; this.cg = Math.cos(s), this.sg = Math.sin(s), this.cw = Math.cos(t), this.sw = Math.sin(t); }, forward: function (t) { t.x -= this.long0; var s, i, a = Math.sin(t.y), h = Math.cos(t.y), e = Math.cos(t.x); switch (this.mode) {
            case Ui.OBLIQ:
                i = this.sinph0 * a + this.cosph0 * h * e;
                break;
            case Ui.EQUIT:
                i = h * e;
                break;
            case Ui.S_POLE:
                i = -a;
                break;
            case Ui.N_POLE: i = a;
        } switch (i = this.pn1 / (this.p - i), s = i * h * Math.sin(t.x), this.mode) {
            case Ui.OBLIQ:
                i *= this.cosph0 * a - this.sinph0 * h * e;
                break;
            case Ui.EQUIT:
                i *= a;
                break;
            case Ui.N_POLE:
                i *= -h * e;
                break;
            case Ui.S_POLE: i *= h * e;
        } var n, r; return n = i * this.cg + s * this.sg, r = 1 / (n * this.sw * this.h1 + this.cw), s = (s * this.cg - i * this.sg) * this.cw * r, i = n * r, t.x = s * this.a, t.y = i * this.a, t; }, inverse: function (t) { t.x /= this.a, t.y /= this.a; var s, i, a, h = { x: t.x, y: t.y }; a = 1 / (this.pn1 - t.y * this.sw), s = this.pn1 * t.x * a, i = this.pn1 * t.y * this.cw * a, t.x = s * this.cg + i * this.sg, t.y = i * this.cg - s * this.sg; var e = Ss(t.x, t.y); if (Math.abs(e) < Ct)
            h.x = 0, h.y = t.y;
        else {
            var n, r;
            switch (r = 1 - e * e * this.pfact, r = (this.p - Math.sqrt(r)) / (this.pn1 / e + e / this.pn1), n = Math.sqrt(1 - r * r), this.mode) {
                case Ui.OBLIQ:
                    h.y = Math.asin(n * this.sinph0 + t.y * r * this.cosph0 / e), t.y = (n - this.sinph0 * Math.sin(h.y)) * e, t.x *= r * this.cosph0;
                    break;
                case Ui.EQUIT:
                    h.y = Math.asin(t.y * r / e), t.y = n * e, t.x *= r;
                    break;
                case Ui.N_POLE:
                    h.y = Math.asin(n), t.y = -t.y;
                    break;
                case Ui.S_POLE: h.y = -Math.asin(n);
            }
            h.x = Math.atan2(t.x, t.y);
        } return t.x = h.x + this.long0, t.y = h.y, t; }, names: ["Tilted_Perspective", "tpers"] }, Hi = { init: function () { if (this.flip_axis = "x" === this.sweep ? 1 : 0, this.h = Number(this.h), this.radius_g_1 = this.h / this.a, this.radius_g_1 <= 0 || this.radius_g_1 > 1e10)
            throw new Error; if (this.radius_g = 1 + this.radius_g_1, this.C = this.radius_g * this.radius_g - 1, 0 !== this.es) {
            var t = 1 - this.es, s = 1 / t;
            this.radius_p = Math.sqrt(t), this.radius_p2 = t, this.radius_p_inv2 = s, this.shape = "ellipse";
        }
        else
            this.radius_p = 1, this.radius_p2 = 1, this.radius_p_inv2 = 1, this.shape = "sphere"; this.title || (this.title = "Geostationary Satellite View"); }, forward: function (t) { var s, i, a, h, e = t.x, n = t.y; if (e -= this.long0, "ellipse" === this.shape) {
            n = Math.atan(this.radius_p2 * Math.tan(n));
            var r = this.radius_p / Ss(this.radius_p * Math.cos(n), Math.sin(n));
            if (i = r * Math.cos(e) * Math.cos(n), a = r * Math.sin(e) * Math.cos(n), h = r * Math.sin(n), (this.radius_g - i) * i - a * a - h * h * this.radius_p_inv2 < 0)
                return t.x = Number.NaN, t.y = Number.NaN, t;
            s = this.radius_g - i, this.flip_axis ? (t.x = this.radius_g_1 * Math.atan(a / Ss(h, s)), t.y = this.radius_g_1 * Math.atan(h / s)) : (t.x = this.radius_g_1 * Math.atan(a / s), t.y = this.radius_g_1 * Math.atan(h / Ss(a, s)));
        }
        else
            "sphere" === this.shape && (s = Math.cos(n), i = Math.cos(e) * s, a = Math.sin(e) * s, h = Math.sin(n), s = this.radius_g - i, this.flip_axis ? (t.x = this.radius_g_1 * Math.atan(a / Ss(h, s)), t.y = this.radius_g_1 * Math.atan(h / s)) : (t.x = this.radius_g_1 * Math.atan(a / s), t.y = this.radius_g_1 * Math.atan(h / Ss(a, s)))); return t.x = t.x * this.a, t.y = t.y * this.a, t; }, inverse: function (t) { var s, i, a, h, e = -1, n = 0, r = 0; if (t.x = t.x / this.a, t.y = t.y / this.a, "ellipse" === this.shape) {
            this.flip_axis ? (r = Math.tan(t.y / this.radius_g_1), n = Math.tan(t.x / this.radius_g_1) * Ss(1, r)) : (n = Math.tan(t.x / this.radius_g_1), r = Math.tan(t.y / this.radius_g_1) * Ss(1, n));
            var o = r / this.radius_p;
            if (s = n * n + o * o + e * e, i = 2 * this.radius_g * e, (a = i * i - 4 * s * this.C) < 0)
                return t.x = Number.NaN, t.y = Number.NaN, t;
            h = (-i - Math.sqrt(a)) / (2 * s), e = this.radius_g + h * e, n *= h, r *= h, t.x = Math.atan2(n, e), t.y = Math.atan(r * Math.cos(t.x) / e), t.y = Math.atan(this.radius_p_inv2 * Math.tan(t.y));
        }
        else if ("sphere" === this.shape) {
            if (this.flip_axis ? (r = Math.tan(t.y / this.radius_g_1), n = Math.tan(t.x / this.radius_g_1) * Math.sqrt(1 + r * r)) : (n = Math.tan(t.x / this.radius_g_1), r = Math.tan(t.y / this.radius_g_1) * Math.sqrt(1 + n * n)), s = n * n + r * r + e * e, i = 2 * this.radius_g * e, (a = i * i - 4 * s * this.C) < 0)
                return t.x = Number.NaN, t.y = Number.NaN, t;
            h = (-i - Math.sqrt(a)) / (2 * s), e = this.radius_g + h * e, n *= h, r *= h, t.x = Math.atan2(n, e), t.y = Math.atan(r * Math.cos(t.x) / e);
        } return t.x = t.x + this.long0, t; }, names: ["Geostationary Satellite View", "Geostationary_Satellite", "geos"] }, Xi = 1.340264, Ki = -.081106, Ji = 893e-6, Vi = .003796, Zi = Math.sqrt(3) / 2, Yi = { init: function () { this.es = 0, this.long0 = void 0 !== this.long0 ? this.long0 : 0; }, forward: function (t) { var s = Vt(t.x - this.long0), i = t.y, a = Math.asin(Zi * Math.sin(i)), h = a * a, e = h * h * h; return t.x = s * Math.cos(a) / (Zi * (Xi + 3 * Ki * h + e * (7 * Ji + 9 * Vi * h))), t.y = a * (Xi + Ki * h + e * (Ji + Vi * h)), t.x = this.a * t.x + this.x0, t.y = this.a * t.y + this.y0, t; }, inverse: function (t) { t.x = (t.x - this.x0) / this.a, t.y = (t.y - this.y0) / this.a; var s, i, a, h, e, n, r = t.y; for (n = 0; n < 12 && (s = r * r, i = s * s * s, a = r * (Xi + Ki * s + i * (Ji + Vi * s)) - t.y, h = Xi + 3 * Ki * s + i * (7 * Ji + 9 * Vi * s), r -= e = a / h, !(Math.abs(e) < 1e-9)); ++n)
            ; return s = r * r, i = s * s * s, t.x = Zi * t.x * (Xi + 3 * Ki * s + i * (7 * Ji + 9 * Vi * s)) / Math.cos(r), t.y = Math.asin(Math.sin(r) / Zi), t.x = Vt(t.x + this.long0), t; }, names: ["eqearth", "Equal Earth", "Equal_Earth"] }, $i = 1e-10, ta = { init: function () { var t; if (this.phi1 = this.lat1, Math.abs(this.phi1) < $i)
            throw new Error; this.es ? (this.en = Ns(this.es), this.m1 = Es(this.phi1, this.am1 = Math.sin(this.phi1), t = Math.cos(this.phi1), this.en), this.am1 = t / (Math.sqrt(1 - this.es * this.am1 * this.am1) * this.am1), this.inverse = dt, this.forward = ft) : (Math.abs(this.phi1) + $i >= wt ? this.cphi1 = 0 : this.cphi1 = 1 / Math.tan(this.phi1), this.inverse = pt, this.forward = mt); }, names: ["bonne", "Bonne (Werner lat_1=90)"] };
    return W.defaultDatum = "WGS84", W.Proj = Projection, W.WGS84 = new W.Proj("WGS84"), W.Point = Point, W.toPoint = cs, W.defs = o, W.nadgrid = function (t, s) { var i = new DataView(s), a = N(i), h = E(i, a), e = { header: h, subgrids: C(i, h, a) }; return os[t] = e, e; }, W.transform = D, W.mgrs = bs, W.version = "2.14.0", function (proj4) { proj4.Proj.projections.add(Cs), proj4.Proj.projections.add(Gs), proj4.Proj.projections.add(Ts), proj4.Proj.projections.add(Ds), proj4.Proj.projections.add(Us), proj4.Proj.projections.add(Qs), proj4.Proj.projections.add(Hs), proj4.Proj.projections.add(Xs), proj4.Proj.projections.add(Ks), proj4.Proj.projections.add(ai), proj4.Proj.projections.add(ci), proj4.Proj.projections.add(fi), proj4.Proj.projections.add(di), proj4.Proj.projections.add(pi), proj4.Proj.projections.add(yi), proj4.Proj.projections.add(xi), proj4.Proj.projections.add(gi), proj4.Proj.projections.add(vi), proj4.Proj.projections.add(wi), proj4.Proj.projections.add(Ni), proj4.Proj.projections.add(Ei), proj4.Proj.projections.add(Ai), proj4.Proj.projections.add(Ci), proj4.Proj.projections.add(Pi), proj4.Proj.projections.add(Oi), proj4.Proj.projections.add(Fi), proj4.Proj.projections.add(Di), proj4.Proj.projections.add(Wi), proj4.Proj.projections.add(Hi), proj4.Proj.projections.add(Yi), proj4.Proj.projections.add(ta); }(W), W;
});
export default proj4;