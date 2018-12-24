// @flow
import React, { useState, useEffect, useMemo, useCallback} from "react";
import Downshift from "downshift";
import {
  Label,
  Menu,
  ControllerButton,
  Input,
  Item,
  ArrowIcon,
  XIcon,
  css,
  getStringItems
} from "./autocomplete-components";
import TextField from "@material-ui/core/TextField";

const Autocomplete = (props: {
  value: string,
  options: Array<{ name: string, id: string }>,
  onChange: (name: string) => void
}) => {
  const [value, setValue] = useState(props.value);
  useEffect(
    () => {
      if (props.value !== value) {
        setValue(props.value);
      }
    },
    [props.value]
  );

  const onBlur = useCallback(() => {
    if (value !== props.value) {
      props.onChange(value)
    }
  }, [value, props.value, props.onChange]);

  const onChange = useCallback(
    changes => {
      if (changes.hasOwnProperty("selectedItem")) {
        // console.log('selected', changes)
        props.onChange(changes.selectedItem);
      } else if (!changes.hasOwnProperty('inputValue')) {
        return
      }
      const newValue = changes.hasOwnProperty("selectedItem")
        ? changes.selectedItem
        : changes.inputValue;
      if (newValue !== value) {
        // console.log('Changing', changes)
        setValue(newValue);
      }
    },
    [value, props.onChange]
  );

  return (
    <Downshift selectedItem={value} onStateChange={onChange}>
      {({
        getLabelProps,
        getInputProps,
        getToggleButtonProps,
        getMenuProps,
        getItemProps,
        isOpen,
        openMenu,
        clearSelection,
        selectedItem,
        inputValue,
        highlightedIndex
      }) => (
        <div>
          <div {...css({ position: "relative" })}>
            <TextField
              {...getInputProps({
                // isOpen,
                onFocus: openMenu,
                onBlur,
                label: props.placeholder
              })}
            />
            {selectedItem ? (
              <ControllerButton
                onClick={() => {clearSelection(); openMenu()}}
                aria-label="clear selection"
              >
                <XIcon />
              </ControllerButton>
            ) : (
              <ControllerButton {...getToggleButtonProps()}>
                <ArrowIcon isOpen={isOpen} />
              </ControllerButton>
            )}
          </div>
          <div {...css({ position: "relative", zIndex: 1000 })}>
            <Menu {...getMenuProps({ isOpen })}>
              {isOpen
                ? getStringItems(props.options, inputValue).map(
                    (item, index) => (
                      <Item
                        key={item}
                        {...getItemProps({
                          item,
                          index,
                          isActive: highlightedIndex === index,
                          isSelected: selectedItem === item
                        })}
                      >
                        {item}
                      </Item>
                    )
                  )
                : null}
            </Menu>
          </div>
        </div>
      )}
    </Downshift>
  );
};

export default Autocomplete;
