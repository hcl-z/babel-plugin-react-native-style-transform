"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var t = require("@babel/types");
exports.default = (function () {
    var css = null;
    var style = null;
    var templateLiteral = null;
    var classNameList = [];
    function transformClassName(node, transformCombineExpression, combineSymbol) {
        var classNameList = [];
        /**
         * @example className={`${style.foo} ${style.bar}`}
         */
        if (t.isTemplateLiteral(node.expression)) {
            classNameList.push(node.expression.expressions);
        }
        /**
         * @example className={[styles.class1, styles.class2].join(" ")}
         */
        else if (isJoinExpression(node)) {
            classNameList.push(node.expression.callee.object.elements);
        }
        /**
         * @example className={`${style.foo} ${style.bar}`}
         */
        else if (transformCombineExpression && isCombinedExpression(node, combineSymbol)) {
            classNameList.push(node.expression.arguments);
        }
        /**
         * @example className={style.foo}
         * @example className={condition ? style.foo : style.bar}
         * @example className={condition && style.foo}
         * ...
         */
        else {
            classNameList.push(node.expression);
        }
        return classNameList;
    }
    function isJoinExpression(node) {
        var expression = node.expression;
        return (t.isCallExpression(expression) &&
            expression.callee &&
            t.isMemberExpression(expression.callee) &&
            expression.callee.property &&
            t.isIdentifier(expression.callee.property) &&
            expression.callee.property.name &&
            expression.callee.property.name.toLowerCase() === "join" &&
            t.isArrayExpression(expression.callee.object));
    }
    function isCombinedExpression(node, symbol) {
        var expression = node.expression;
        return (t.isCallExpression(expression) &&
            t.isJSXExpressionContainer(node) &&
            expression.callee &&
            t.isIdentifier(expression.callee) &&
            expression.callee.name.toLowerCase() === symbol);
    }
    return {
        name: "react-native-classname-to-style",
        visitor: {
            JSXOpeningElement: {
                exit: function (path, state) {
                    var flatClassNameList = classNameList.flat();
                    console.log('111', flatClassNameList);
                    if (flatClassNameList.length === 0) {
                        return;
                    }
                    if (flatClassNameList.length === 1) {
                        path.node.attributes.push(t.jsxAttribute(t.jsxIdentifier("style"), t.jsxExpressionContainer(flatClassNameList[0])));
                    }
                    else {
                        var newStyle = t.arrayExpression(flatClassNameList);
                        path.node.attributes.push(t.jsxAttribute(t.jsxIdentifier("style"), t.jsxExpressionContainer(newStyle)));
                    }
                }
            },
            JSXAttribute: function JSXAttribute(path, state) {
                var _a = (state === null || state === void 0 ? void 0 : state.opts) || {}, _b = _a.keepClassName, keepClassName = _b === void 0 ? false : _b, _c = _a.combineSymbol, combineSymbol = _c === void 0 ? '$' : _c, _d = _a.transformCombineExpression, transformCombineExpression = _d === void 0 ? true : _d;
                var name = path.node.name.name;
                if (name === "className") {
                    if (t.isJSXExpressionContainer(path.node.value)) {
                        classNameList.push.apply(classNameList, transformClassName(path.node.value, transformCombineExpression, combineSymbol));
                    }
                    if (!keepClassName) {
                        path.remove();
                    }
                }
                else if (name === "style") {
                    if (t.isJSXExpressionContainer(path.node.value)) {
                        classNameList.push(path.node.value.expression);
                    }
                    path.remove();
                }
            }
        }
    };
});
