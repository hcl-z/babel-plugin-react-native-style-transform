import { PluginObj } from "@babel/core";
import * as t from "@babel/types";

interface PluginOptions {
  combineSymbol?: string
  keepClassName?: boolean
  transformCombineExpression?: boolean
}

export default (): PluginObj => {
  let classNameList = [];

  function transformClassName(node: t.JSXExpressionContainer, transformCombineExpression: boolean, combineSymbol: string) {
    let classNameList = []
    /**
     * @example className={`${style.foo} ${style.bar}`}
     */
    if (t.isTemplateLiteral(node.expression)) {
      classNameList.push(node.expression.expressions)
    }
    /**
     * @example className={[styles.class1, styles.class2].join(" ")}
     */
    else if (isJoinExpression(node)) {
      classNameList.push((node as any).expression.callee.object.elements)
    }
    /**
     * @example className={`${style.foo} ${style.bar}`}
     */
    else if (transformCombineExpression && isCombinedExpression(node, combineSymbol)) {
      classNameList.push((node.expression as t.CallExpression).arguments)
    }
    /**
     * @example className={style.foo}
     * @example className={condition ? style.foo : style.bar}
     * @example className={condition && style.foo}
     * ...
     */
    else {
      classNameList.push(node.expression)
    }

    return classNameList
  }

  function isJoinExpression(node: t.JSXExpressionContainer) {
    const expression = node.expression
    return (
      t.isCallExpression(expression) &&
      expression.callee &&
      t.isMemberExpression(expression.callee) &&
      expression.callee.property &&
      t.isIdentifier(expression.callee.property) &&
      expression.callee.property.name &&
      expression.callee.property.name.toLowerCase() === "join" &&
      t.isArrayExpression(expression.callee.object)
    );
  }

  function isCombinedExpression(node: t.JSXExpressionContainer, symbol: string) {
    const expression = node.expression
    return (
      t.isCallExpression(expression) &&
      t.isJSXExpressionContainer(node) &&
      expression.callee &&
      t.isIdentifier(expression.callee) &&
      expression.callee.name.toLowerCase() === symbol
    );
  }

  return {
    name: "react-native-classname-to-style",
    visitor: {
      JSXOpeningElement: {
        exit(path, state) {
          const flatClassNameList = classNameList.flat()
          if (flatClassNameList.length === 0) {
            return
          }

          if (flatClassNameList.length === 1) {
            path.node.attributes.push(t.jsxAttribute(t.jsxIdentifier("style"), t.jsxExpressionContainer(flatClassNameList[0])))
          } else {
            const newStyle = t.arrayExpression(flatClassNameList)
            path.node.attributes.push(t.jsxAttribute(t.jsxIdentifier("style"), t.jsxExpressionContainer(newStyle)))
          }
        }
      },

      JSXAttribute: function JSXAttribute(path, state) {
        const { keepClassName = false, combineSymbol = '$', transformCombineExpression = true } = (state as any)?.opts as PluginOptions || {}

        let name = path.node.name.name;
        if (name === "className") {
          if (t.isJSXExpressionContainer(path.node.value)) {
            classNameList.push(...transformClassName(path.node.value, transformCombineExpression, combineSymbol))
          }
          if (!keepClassName) {
            path.remove()
          }
        } else if (name === "style") {
          if (t.isJSXExpressionContainer(path.node.value)) {
            classNameList.push(path.node.value.expression)
          }
          path.remove()
        }

      }
    }
  }
};
