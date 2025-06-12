# babel-plugin-react-native-style-transform

Transform JSX `className` property to `style` property in react-native.

## Usage

### Step 1: Install

```sh
yarn add --dev babel-plugin-react-native-style-transform
```

or

```sh
npm install --save-dev babel-plugin-react-native-style-transform
```

### Step 2: Configure `.babelrc`

```
{
  "presets": [
    "react-native"
  ],
  "plugins": [
    ["react-native-style-transform",{
      combineSymbol: "$"
      keepClassName:true
      transformCombineExpression:true
    }]
  ]
}
```
| option    | type | default | desc |
| -------- | ------- | -------| --------|
| combineSymbol  | string | & | handle combine expression symbol |
| keepClassName | bool | false | keep className not be removed |
| transformCombineExpression | bool | true | if handle combine symbol |


## Syntax

## Single class

Example:

```jsx
<Text className={styles.myClass} />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={styles.myClass} />
```

---

...or with `className` and `style`:

```jsx
<Text className={styles.myClass} style={{ color: "blue" }} />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={[styles.myClass, { color: "blue" }]} />
```

## Multiple classes

#### Using `[styles.class1, styles.class2].join(" ")` syntax

Example:

```jsx
<Text className={[styles.class1, styles.class2].join(" ")} />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={[styles.class1, styles.class2]} />
```

---

...or with `className` and `style`:

```jsx
<Text
  className={[styles.class1, styles.class2].join(" ")}
  style={{ color: "blue" }}
/>
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={[styles.class1, styles.class2, { color: "blue" }]} />
```

#### Using template literal syntax

Example:

```jsx
<Text className={`${styles.class1} ${styles.class2}`} />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={[styles.class1, styles.class2]} />
```

---

...or with `className` and `style`:

```jsx
<Text
  className={`${styles.class1} ${styles.class2}`}
  style={{ color: "blue" }}
/>
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={[styles.class1, styles.class2, { color: "blue" }]} />
```

## Using ternary operator

Example:

```jsx
<Text className={isTrue ? styles.class1 : styles.class2} />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={isTrue ? styles.class1 : styles.class2} />
```

## combine expression
Example:

```jsx
<Text className={$(style.class1,style.class2)} />
```

↓ ↓ ↓ ↓ ↓ ↓

```jsx
<Text style={[styles.class1 : styles.class2]} />
```