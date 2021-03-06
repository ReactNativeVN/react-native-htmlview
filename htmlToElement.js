var React = require('react')
var ReactNative = require('react-native')
var htmlparser = require('./vendor/htmlparser2')
var entities = require('./vendor/entities')

var {
  Text,
} = ReactNative

var Image = require('./helper/Image')


var LINE_BREAK = '\n'
var PARAGRAPH_BREAK = '\n\n'
var BULLET = '\u2022 '

function htmlToElement(rawHtml, opts, done) {
  function domToElement(dom, parent) {
    if (!dom) return null

    return dom.map((node, index, list) => {
      if (opts.customRenderer) {
        var rendered = opts.customRenderer(node, index, list)
        if (rendered || rendered === null) return rendered
      }

      if (node.type == 'text') {
        return (
          <Text key={index} style={[parent ? opts.styles[parent.name] : null]}>
            {entities.decodeHTML(node.data)}
          </Text>
        )
      }

      if (node.type == 'tag') {
        if (node.name == 'img') {
          var img_w = +node.attribs['width'] || +node.attribs['data-width'] || 0
          var img_h = +node.attribs['height'] || +node.attribs['data-height'] || 0

          var img_style = {
            width: img_w,
            height: img_h,
          }
          var source = {
            uri: node.attribs.src,
            width: img_w,
            height: img_h,
          }
          return (
            <Image key={index} source={source} style={img_style} />
          )
        }

        var linkPressHandler = null
        if (node.name == 'a' && node.attribs && node.attribs.href) {
          linkPressHandler = () => opts.linkHandler(entities.decodeHTML(node.attribs.href))
        }

        if (node.name === 'font') {
          if (node.attribs.color) {
            return (
              <Text key={index} style={{color: `${node.attribs.color}`}}>
                {domToElement(node.children, node)}
              </Text>
            )
          }
        }

        return (
          <Text key={index} onPress={linkPressHandler}>
            {node.name == 'pre' ? LINE_BREAK : null}
            {node.name == 'li' ? BULLET : null}
            {node.name == 'meaning' ? "☆ " : null}
            {node.name == 'sample' ? "→ " : null}
            {node.name == 'samplemeaning' ? "© " : null}
            {domToElement(node.children, node)}
            {node.name == 'grammar' ? LINE_BREAK : null}
            {node.name == 'connection' ? LINE_BREAK : null}
            {node.name == 'conversation' ? LINE_BREAK : null}
            {node.name == 'explanation' ? LINE_BREAK : null}
            {node.name == 'example' ? LINE_BREAK : null}
            {node.name == 'exercise' ? LINE_BREAK : null}
            {node.name == 'answer' ? LINE_BREAK : null}

            {node.name == 'samemeaning' ? LINE_BREAK : null}
            {node.name == 'type' ? LINE_BREAK : null}
            {node.name == 'meaning' ? LINE_BREAK : null}
            {node.name == 'sample' ? LINE_BREAK : null}
            {node.name == 'samplemeaning' ? LINE_BREAK : null}
            {node.name == 'hiragana' ? LINE_BREAK : null}
            {node.name == 'br' || node.name == 'li' ? LINE_BREAK : null}
            {node.name == 'p' && index < list.length - 1 ? PARAGRAPH_BREAK : null}
            {node.name == 'h1' || node.name == 'h2' || node.name == 'h3' || node.name == 'h4' || node.name == 'h5' ? LINE_BREAK : null}
          </Text>
        )
      }
    })
  }

  var handler = new htmlparser.DomHandler(function(err, dom) {
    if (err) done(err)
    done(null, domToElement(dom))
  })
  var parser = new htmlparser.Parser(handler)
  parser.write(rawHtml)
  parser.done()
}

module.exports = htmlToElement
