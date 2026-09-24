import { useEffect, useRef, useState } from "react";
import { View, Text, Image, Input } from "@uno/ui/react";

export default function App({ backgroundColor = "#F5F2EC", defaultName = "React" }) {
  const dom_input = useRef(null);
  const [name, setName] = useState(defaultName);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (dom_input.current && dom_input.current.value !== name) {
      dom_input.current.value = name;
    }
  }, [name]);

  useEffect(
    () => () => {
      if (dom_input.current) {
        dom_input.current.onblur = null;
        dom_input.current.remove();
        dom_input.current = null;
      }
    },
    []
  );

  function focusInput(event) {
    setFocused(true);
    if (typeof document === "undefined") return;

    if (!dom_input.current) {
      // The DOM input captures typing, paste, and IME for the Uno input.
      const input = document.createElement("input");
      input.tabIndex = -1;
      input.style.cssText = "position: fixed; left: 0; bottom: 0; width: 1px; height: 1px; opacity: 0; pointer-events: none;";
      input.oninput = () => setName(input.value);
      document.body.appendChild(input);
      dom_input.current = input;
    }

    const input = dom_input.current;
    input.value = name;
    input.onblur = () => event.target.blur();
    input.focus({ preventScroll: true });
  }

  function blurInput() {
    setFocused(false);
    dom_input.current?.blur();
  }

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        fontFamily: "ChangaOne",
        borderRadius: "12px",
        backgroundColor,
      }}
    >
      <Image src="assets/coin.png" width="64px" />

      <Text style={{ fontSize: "28px", color: "#23272F" }}>
        {name ? `Hello, ${name}!` : "Your name"}
      </Text>

      <Input
        value={name}
        placeholder="Your name"
        onFocus={focusInput}
        onBlur={blurInput}
        style={{
          width: "240px",
          height: "44px",
          padding: "0px 12px",
          fontSize: "18px",
          color: "#23272F",
          backgroundColor: "#FFFFFF",
          border: focused ? "2px solid #087ea4" : "2px solid #b9c9ce",
          borderRadius: "12px",
        }}
      />

      <View
        onClick={() => setName("")}
        onPointerOver={() => name && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        style={{
          width: "240px",
          height: "44px",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: name ? (hovered ? "#40B4CF" : "#087ea4") : "#b9c9ce",
          borderRadius: "12px",
        }}
      >
        <Text
          style={{ fontSize: "16px", color: "#ffffff", pointerEvents: "none" }}
        >
          Clear
        </Text>
      </View>
    </View>
  );
}
