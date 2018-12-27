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

    if (this.props.onClick) {
      this.props.onClick();
    }
  };

  render(
    {
      children,
      fallbackOne = 'Are you certain?',
      cancel = 'Cancel and return to safety'
    },
    { clicked }
  ) {
    return (
      <div class="delete-data">
        {clicked ? (
          <button
            type="button"
            class="button button--grey"
            onClick={() => this.setState({ clicked: 0 })}
          >
            {cancel}
          </button>
        ) : null}
        <button
          type="button"
          class="button button--scary"
          onClick={this.onClick}
        >
          {clicked === 0 && children}
          {clicked === 1 && fallbackOne}
        </button>
      </div>
    );
  }
}

export { ScaryButton };
