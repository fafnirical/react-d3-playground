import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { csvParse } from 'd3-dsv';
import { linkRadial } from 'd3-shape';
import { stratify, tree } from 'd3-hierarchy';

import './style.css';

function radialPoint(x, y) {
  return [
    y * Math.cos(x - (Math.PI / 2)),
    y * Math.sin(x - (Math.PI / 2)),
  ];
}

export default class RadialTidyTree extends Component {
  constructor(props) {
    super(props);

    this.state = {
      links: [],
      nodes: [],
    };
  }

  async componentWillMount() {
    const csv = csvParse(await import('./flare.csv'));

    const root = tree()
      .size([2 * Math.PI, 500])
      .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)(
        stratify()
          .parentId(d => d.id.substring(0, d.id.lastIndexOf('.')))(
            csv,
          ),
      );

    this.setState({
      links: root.links(),
      nodes: root.descendants(),
    });
  }

  render() {
    const { links, nodes } = this.state;

    return (
      <svg width={this.props.width} height={this.props.height}>
        <g transform={`translate(${(this.props.width / 2) + 40},${(this.props.height / 2) + 90})`}>
          {links.map(link => (
            <path className="link" d={linkRadial().angle(d => d.x).radius(d => d.y)(link)} key={`${link.source.id}-${link.target.id}`} />
          ))}
          {nodes.map(node => (
            <g className={`node ${node.children ? 'node--internal' : 'node--leaf'}`} transform={`translate(${radialPoint(node.x, node.y)})`} key={node.id}>
              <circle r="2.5" />
              <text
                dy="0.31em"
                x={(node.x < Math.PI) === !node.children ? 6 : -6}
                textAnchor={(node.x < Math.PI) === !node.children ? 'start' : 'end'}
                transform={`rotate(${(node.x < Math.PI ? node.x - (Math.PI / 2) : node.x + (Math.PI / 2)) * (180 / Math.PI)})`}
              >
                {node.id.substring(node.id.lastIndexOf('.') + 1)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    );
  }
}

RadialTidyTree.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

RadialTidyTree.defaultProps = {
  width: 960,
  height: 1060,
};
