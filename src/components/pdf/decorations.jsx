import { View, Text, Svg, Path, Rect } from '@react-pdf/renderer'

// Triple border frame applied to every page
export function PageBorders({ theme }) {
  return (
    <>
      <View style={{
        position: 'absolute', top: 18, left: 18, right: 18, bottom: 18,
        borderWidth: 2, borderColor: theme.border, borderStyle: 'solid',
      }} />
      <View style={{
        position: 'absolute', top: 24, left: 24, right: 24, bottom: 24,
        borderWidth: 0.5, borderColor: theme.border, borderStyle: 'solid', opacity: 0.5,
      }} />
      <View style={{
        position: 'absolute', top: 28, left: 28, right: 28, bottom: 28,
        borderWidth: 1, borderColor: theme.border, borderStyle: 'solid',
      }} />
      {/* Corner diamonds */}
      <CornerDiamond theme={theme} top={16} left={16} />
      <CornerDiamond theme={theme} top={16} right={16} />
      <CornerDiamond theme={theme} bottom={16} left={16} />
      <CornerDiamond theme={theme} bottom={16} right={16} />
    </>
  )
}

// Corner diamond ornament
function CornerDiamond({ theme, top, left, right, bottom }) {
  const style = { position: 'absolute', width: 8, height: 8 }
  if (top !== undefined) style.top = top
  if (left !== undefined) style.left = left
  if (right !== undefined) style.right = right
  if (bottom !== undefined) style.bottom = bottom

  return (
    <Svg viewBox="0 0 10 10" style={style}>
      <Path d="M5 0 L10 5 L5 10 L0 5 Z" fill={theme.border} />
    </Svg>
  )
}

// Ornamental divider with center diamond
export function OrnamentalDivider({ theme, width = 200, style: extraStyle }) {
  return (
    <View style={[{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      width,
      marginVertical: 10,
    }, extraStyle]}>
      <View style={{ flex: 1, height: 0.5, backgroundColor: theme.border, opacity: 0.5 }} />
      <Svg viewBox="0 0 10 10" style={{ width: 7, height: 7, marginHorizontal: 6 }}>
        <Path d="M5 0 L10 5 L5 10 L0 5 Z" fill={theme.border} />
      </Svg>
      <View style={{ flex: 1, height: 0.5, backgroundColor: theme.border, opacity: 0.5 }} />
    </View>
  )
}

// Simple line divider
export function LineDivider({ theme, width = '80%', style: extraStyle }) {
  return (
    <View style={[{
      height: 0.5,
      backgroundColor: theme.border,
      opacity: 0.3,
      alignSelf: 'center',
      width,
      marginVertical: 8,
    }, extraStyle]} />
  )
}

// Cross symbol
export function CrossSymbol({ theme, size = 24, style: extraStyle }) {
  return (
    <Svg viewBox="0 0 24 24" style={[{ width: size, height: size, alignSelf: 'center' }, extraStyle]}>
      <Rect x="10" y="2" width="4" height="20" fill={theme.heading} />
      <Rect x="4" y="6" width="16" height="4" fill={theme.heading} />
    </Svg>
  )
}

// Triple dot ornament
export function TripleDot({ theme, style: extraStyle }) {
  return (
    <View style={[{
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      marginVertical: 6,
    }, extraStyle]}>
      <Text style={{ fontSize: 8, color: theme.border, marginRight: 8 }}>◆</Text>
      <Text style={{ fontSize: 10, color: theme.border, marginRight: 8 }}>❖</Text>
      <Text style={{ fontSize: 8, color: theme.border }}>◆</Text>
    </View>
  )
}

// Page number
export function PageNumber({ theme, num }) {
  return (
    <Text style={{
      position: 'absolute', bottom: 32, left: 0, right: 0,
      textAlign: 'center', fontFamily: 'Cormorant', fontSize: 9,
      color: theme.border, letterSpacing: 2,
    }}>
      {num}
    </Text>
  )
}
