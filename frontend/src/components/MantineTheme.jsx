import { createTheme } from "@mantine/core";

// color palette from https://mantine.dev/colors-generator/?color=F21616
const red = [
  "#ffe9e9",
  "#ffd1d1",
  "#fba0a1",
  "#f76d6d",
  "#f34141",
  "#f22625",
  "#f21616",
  "#d8070b",
  "#c10008",
  "#a90003",
];

const MantineTheme = createTheme({
  colors: {
    red,
  },
  primaryColor: "red",
  primaryShade: 6,
});

export default MantineTheme;
