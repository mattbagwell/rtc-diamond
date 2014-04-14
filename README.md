rtc-diamond
===========

This is the primary script used for the interactive web-app at http://www.rothschildtrading.com/diamond-calculator-buying-guide
This script sets up the app interface, which provides with real-time quotes for diamonds.

This module can loosely be understood as:

*	**aspects**
	Properties of the diamond such as color, clarity, carat size, etc.  
    These include the current value as well as the available range/limits/options

*	**events**  
	Bindings for when diamond aspects change  
    So we can update the visualizer and any other dependent options

*	**initialization** - to set up the UI elements and events
