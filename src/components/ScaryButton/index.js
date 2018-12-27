import { h, Component } from 'preact';

class ScaryButton extends Component {
  state = {
    clicked: 0
  };

  onClick = () => {
    if (this.state.clicked === 0) {
      this.setState({ clicked: 1 });
      return;
    }

    if (this.state.clicked === 1) {
      this.setState({ clicked: 2 });
      return;
    }

    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  render(
    {
      children,
      fallbackOne = 'Are you sure?',
      fallbackTwo = "There's no going back from here!"
    },
    { clicked }
  ) {
    return (
      <button type="button" class="button button--scary" onClick={this.onClick}>
        {clicked === 0 && children}
        {clicked === 1 && fallbackOne}
        {clicked === 2 && fallbackTwo}
      </button>
    );
  }
}

export { ScaryButton };
