import React from 'react'

const Card = ({ 
  children, 
  className = '', 
  padding = 'medium',
  shadow = 'medium',
  ...props 
}) => {
  const paddingClasses = {
    small: 'card-padding-small',
    medium: 'card-padding-medium',
    large: 'card-padding-large'
  }
  
  const shadowClasses = {
    none: 'card-shadow-none',
    small: 'card-shadow-small',
    medium: 'card-shadow-medium',
    large: 'card-shadow-large'
  }

  const classes = [
    'card',
    paddingClasses[padding],
    shadowClasses[shadow],
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Card
